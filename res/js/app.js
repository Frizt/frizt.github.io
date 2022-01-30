"use strict";

var webStorage = WebStorage();

function NWItem(itemName, database, options) {
    options = options || {};

    var RefinerTag = (tag, multipliers) => {
        return {
            tag: tag,
            multipliers: multipliers
        };
    };
    var Refiner = (name, tier, multiplier) => {
        return {
            name: name,
            tier: tier,
            multiplier: multiplier
        };
    };
    var IngredientTag = (tags, count) => {
        return {
            tags: tags,
            count: count
        };
    };
    var Ingredient = (name, count) => {
        return {
            name: name,
            count: count
        };
    };

    var Craft = (ingredients) => {
        return {
            valuePerOne: 0,
            ingredients: ingredients
        };
    };

    var self;
    self = {
        database: database,
        baseMultiplier: options.baseMultiplier || 0,
        skill: "",
        name: itemName,
        ingredientList: [],
        refiner: null,
        refinerList: [],
        marketValue: 0,
        refinedCraftIngredientList: [],
        craftValue: 0,
        marketCheaper: false,
        usedIn: {},
        refinerFor: {},
		aptitudeDiscount: 0,
        type: "",
        bestRefiner: null,
        xp: null,
        tags: [],
        addTags: (tags) => {
            for(var i = 0; i < tags.length; i++) {
                self.addTag(tags[i]);
            }
            return self;
        },
        addTag: (tag) => {
            if(self.tags.indexOf(tag) === -1) {
                self.tags.push(tag);
            }
            return self;
        },
        setTier: (tier) => {
            var tags = self.tags;
            for(var i = tags.length - 1; i >= 0; i--) {
                var tag = tags[i];
                if(tag.length >= 2) {
                    if(tag[0] === "t") {
                        tags.splice(i, 0);
                    }
                }
            }
            tags.push(`t${tier}`);
        },
        setSkill: (skill) => {
            self.skill = skill || "";
        },
        setMarketValue: (marketValue) => {
            self.marketValue = marketValue;
            if(!self.cheapestValue) self.cheapestValue = marketValue;
            return self;
        },
        setBaseMultiplier: (baseMultiplier) => {
            self.baseMultiplier = baseMultiplier;
            return self;
        },
        getRefinerList: () => {
            var list = [];
            if(self.refiner) {
                var refinerList = database.getTagList(self.refiner.tag);
                for(var i = 0; i < refinerList.length; i++) {
                    var refinerItem = self.database.getItem(refinerList[i]);
                    if(refinerItem) {
                        var multiplier = 0;
                        var refinerTier = 1;
                        for(var j = 0; j < 2; j++) {
                            var tier = `t${j+2}`;
                            if(refinerItem.tags.indexOf(tier) !== -1) {
                                multiplier = self.refiner.multipliers[j];
                                refinerTier = j + 2;
                            }
                        }
                        list.push(Refiner(refinerItem.name, refinerTier, multiplier));
                    }
                }
            }
            return list;
        },
        updateCraftValue: () => {
            var rawCraftValue = 0;
            var craftValue = 0;
            var craftIngredients = [];
            var baseMultiplier = self.baseMultiplier;
            var totalMultiplier = baseMultiplier + database.getSkillMultiplier(self.skill);
            self.refinerList = [];
            for(var i = 0; i < self.ingredientList.length; i++) {
                var ingredient = self.ingredientList[i];
                var ingredientItem = database.getBestItemWithTags(ingredient.tags, ingredient.tier);
                if(ingredientItem) {
                    if(ingredientItem.name === self.name) {
                        console.error(`Recursive ingredient ${self.name}:${ingredient.tags} passed in`);
                        break;
                    }
                    ingredientItem.usedIn[self.name] = ingredient.count;
                    ingredientItem.updateCraftValue();

                    var craftIngredient = Ingredient(ingredientItem.name, ingredient.count);
                    craftIngredients.push(craftIngredient);
                    rawCraftValue += ingredientItem.craftValue * ingredient.count;
                }
                else {
                    console.error(`Ingredient "${ingredient.tags}" not in database`);
                }
            }
            self.bestRefiner = null;
            if(self.refiner) {
                var refinerList = self.getRefinerList();
                self.refinerList = refinerList;
                var bestRefinerItem = null;
                var bestRefinerValue = null;
                var bestRefiner = null;
                for(var i = 0; i < refinerList.length; i++) {
                    var refiner = refinerList[i];
                    var refinerItem = database.getItem(refiner.name);
                    if(refinerItem) {
                        refinerItem.usedIn[self.name] = 1.0 / (1 + self.baseMultiplier + refiner.multiplier);
                        refinerItem.refinerFor[self.name] = 1;
                        refiner.addedValue = (rawCraftValue * (1 + refiner.multiplier)) - rawCraftValue - refinerItem.marketValue;
                        if(bestRefinerItem === null || refiner.addedValue > bestRefinerValue) {
                            bestRefinerValue = refiner.addedValue;
                            bestRefinerItem = refinerItem;
                            bestRefiner = refiner;
                        }
                    }
                }
                if(bestRefinerItem) {
                    self.bestRefiner = bestRefiner;
                    totalMultiplier = baseMultiplier + bestRefiner.multiplier + database.getSkillMultiplier(self.skill);
                    craftValue += bestRefinerItem.marketValue / (1 + totalMultiplier);
                }
            }
            self.aptitudeDiscount = 0;
            if(self.ingredientList.length > 0) {
                for(var i = 0; i < craftIngredients.length; i++) {
                    var craftIngredient = craftIngredients[i];
                    var ingredientItem = database.getItem(craftIngredient.name);
                    craftIngredient.count /= 1 + totalMultiplier;
                }
                for(var i = 0; i < craftIngredients.length; i++) {
                    var craftIngredient = craftIngredients[i];
                    var ingredientItem = database.getItem(craftIngredient.name);
                    craftValue += ingredientItem.cheapestValue * craftIngredient.count;
                }
                self.refinedCraftIngredientList = craftIngredients;
                if(self.xp && self.skill) {
                    self.aptitudeDiscount = database.getAptititudeDiscount(self.skill, self.xp / (1 + totalMultiplier));
                    //console.log(`Discount for ${self.name} is ${self.aptitudeDiscount}$`);
                    //craftValue -= self.aptitudeDiscount;
                }
            }
            else {
                craftValue = self.marketValue;
            }
            self.totalMultiplier = totalMultiplier;
            self.craftValue = craftValue;
            self.isMarketCheaper = self.marketValue > 0 && self.marketValue <= self.craftValue;
            self.cheapestValue = self.isMarketCheaper ? self.marketValue : self.craftValue;
        },
        addIngredient: (tags, count) => {
            if(typeof count === "undefined") {
                console.error("Bad add ingredient");
            }
            self.ingredientList.push(IngredientTag(tags, count));
            return self;
        },
        setIngredients: (ingredients) => {
            self.ingredientList = [];
            for(var i = 0; i < ingredients.length; i++) {
                var ingredient = ingredients[i];
                self.addIngredient(ingredient.tags, ingredient.count);
            }
        },
        setXp: (xp) => {
            self.xp = xp;
            return self;
        },
        setRefiner: (tag, multipliers) => {
            self.refiner = RefinerTag(tag, multipliers);
            return self;
        },
        setTags: (tags) => {
            self.tags = tags;
            return self;
        },
        removeRefiner: () => {
            self.refiner = null;
            return self;
        },
        exportToJson: () => {
            var op = {};
            var json = {};
            if(self.baseMultiplier) json.baseMultiplier = self.baseMultiplier;
            if(self.tags.length > 0) {
                json.tags = self.tags;
            }
            if(self.ingredientList.length > 0) {
                var ingredientList = [];
                for(var i = 0; i < self.ingredientList.length; i++) {
                    ingredientList.push(self.ingredientList[i]);
                }
                json.ingredients = ingredientList;
            }
            if(self.refiner) {
                json.refiner = self.refiner;
            }
            if(self.type.length) json.type = self.type;
            if(self.xp !== null) json.xp = self.xp;
            return json;
        },
        node: null,
        remove: () => {
            if(self.node) {
                var infoInputs = self.node.querySelectorAll(".item_info_misc input");
                for(var i = 0; i < infoInputs.length; i++) {
                    var input = infoInputs[i];
                    domEventListener.removeEvent(input, "change", "info");
                }
            }
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            if(self.ingredientVlist) self.ingredientVlist.vlist.remove();
            if(self.node) removeFromParent(self.node);
            var keys = Object.keys(self.usedIn);
            for(var i = 0; i < keys.length; i++) {
                var item = self.database.getItem(self.usedIn[keys[i]]);
                if(!item) continue;
                delete item.usedIn[self.name];
            }
            delete self.database.itemMap[self.name];
        },
        getAllIngredients: () => {
            var db = self.database;
            var results = {
                items: [],
                refiners: []
            };
            if(self.refinerList.length) {
                for(var i = 0; i < self.refinerList.length; i++) {
                    var refiner = self.refinerList[i];
                    var refinerItem = db.getItem(refiner.name);
                    if(refinerItem) {
                        var isBestRefiner = self.bestRefiner.name === refinerItem.name;
                        results.refiners.push({
                            bestRefiner: isBestRefiner,
                            item: refinerItem,
                            count: isBestRefiner ? (1.0 / (1 + self.totalMultiplier)) : 0
                        });
                    }
                }
            }
            for(var j = 0; j < self.refinedCraftIngredientList.length; j++) {
                var ingredient = self.refinedCraftIngredientList[j];
                var ingredientItem = db.getItem(ingredient.name);
                if(!ingredientItem) {
                    continue;
                }
                results.items.push({
                    name: ingredientItem.name,
                    item: ingredientItem,
                    count: ingredient.count
                });
            }
            for(var j = 0; j < self.refinedCraftIngredientList.length; j++) {
                var ingredient = self.refinedCraftIngredientList[j];
                var ingredientItem = db.getItem(ingredient.name);
                if(!ingredientItem) {
                    continue;
                }
                var subIngredients = ingredientItem.getAllIngredients();
                for(var i = 0; i < subIngredients.items.length; i++) {
                    var subIngredient = subIngredients.items[i];
                    var matched = false;
                    var count = ingredient.count * subIngredient.count;
                    for(var k = 0; k < results.items.length; k++) {
                        var item = results.items[k];
                        if(item.item.name === subIngredient.item.name) {
                            matched = true;
                            item.count += count;
                            break;
                        }
                    }
                    if(!matched) {
                        subIngredient.count = count;
                        results.items.push(subIngredient);
                    }
                }

                for(var i = 0; i < subIngredients.refiners.length; i++) {
                    var subRefiner = subIngredients.refiners[i];
                    var matched = false;
                    var count = subRefiner.count / (1 + subRefiner.item.totalMultiplier);
                    for(var k = 0; k < results.refiners.length; k++) {
                        var refiner = results.refiners[k];
                        if(refiner.item.name === subRefiner.item.name) {
                            matched = true;
                            refiner.count += count;
                            break;
                        }
                    }
                    if(!matched) {
                        subRefiner.count = count;
                        subRefiner.bestRefiner = false;
                        results.refiners.push(subRefiner);
                    }
                }
            }
            return results;
        },
        renderedCraftCount: 1,
        onCraftCountChange: (e) => {
            var value = numbersOnly(e.target.value) || 1;
            if(self.renderedCraftCount !== value) {
                self.renderedCraftCount = value;
                self.updateNode();
            }
        },
        updateNode: () => {
            if(self.node) {
                var craftCountNode = self.node.querySelector(".item_info_craft_count");
                var craftCount = self.renderedCraftCount || 1;
                craftCountNode.removeEventListener("change", self.onCraftCountChange);
                craftCountNode.addEventListener("change", self.onCraftCountChange);

                requestAnimationFrame(() => {
                    var xpString = null;
                    if(self.xp) xpString = `Xp/Tot: ${Math.round(self.xp * craftCount * 100)/100} Xp/g:${Math.round(self.xp / self.craftValue * 100) / 100}`;
                    var gearMultiplier = database.getSkillMultiplier(self.skill);
                    if(self.node) {
                        var aptXp = database.getAptitudeXp(self.skill);
                        var aptStr = "";
                        var aptDiscount = self.aptitudeDiscount;
                        var craftPrice = Math.round(self.craftValue * 100 * craftCount);
                        if(aptDiscount) {
                            aptStr = ` - WithAptitude: $${Math.round(craftPrice - self.aptitudeDiscount * 100 * craftCount) / 100}`;
                        }
                        var inject = {
                            item_info_name: self.name,
                            item_info_craft_count: craftCount,
                            craft_price: `$${craftPrice / 100}${aptStr}`,
                            market_price: `$${Math.round(self.marketValue * 100) / 100}`,
                            xp: self.xp || 0,
                            skill: `${self.skill ? self.skill : "N/A"}`,
                            base_multiplier: `${self.baseMultiplier ? (Math.round(self.baseMultiplier * 10000)/100) : "N/A"}%`,
                            gear_multiplier: `${gearMultiplier ? (Math.round(gearMultiplier * 10000)/100) : "N/A"}%`,
                            total_multiplier: `${Math.round(self.totalMultiplier * 10000)/100}%`,
                            total_per_aptitude: `${(aptXp && self.xp) ? Math.round(aptXp / self.xp * 100)/100 : "N/A"}`,
                            xp_per_gold: self.xp ? `${Math.round(self.xp / self.craftValue)}` : "0",
                            tags: self.tags.join(", ")
                        };
                        injectHtml(self.node, inject);
                    }
                    var ingredientsDiv = self.node.querySelector(".item_ingredients");
                    var ingredients = self.getAllIngredients();
                    self.ingredientVlist.setList(ingredients.items);
                    self.refinerVlist.setList(ingredients.refiners);
                    self.recipeVlist.setList(self.ingredientList);
                    var list = [];
                    var keys = Object.keys(self.usedIn);
                    for(var i = 0; i < keys.length; i++) {
                        var count = self.usedIn[keys[i]];
                        list.push({
                            name: keys[i],
                            count: count
                        });
                    }
                    self.usedInVlist.setList(list);
                });
            }
        },
        generateNode: () => {
            var db = self.database;
            var cont = document.querySelector(".templates .item_info").cloneNode(true);
            self.node = cont;
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            var onInput = (e) => {
                var value = e.target.value;
                var node = getFirstParentWithClass(e.target, "virtual_list_item");
                if(node) {
                    var name = node.getAttribute("data-name");
                    var inputType = e.target.getAttribute("data-value_type");
                    switch(inputType) {
                        case "refined_count":
                            self.renderedCraftCount = 1;
                            var ingredient = null;
                            if(self.name === name) ingredient = self;
                            else {
                                var ingredients = self.getAllIngredients();
                                for(var i = 0; i < ingredients.items.length; i++) {
                                    var ingredient = ingredients.items[i];
                                    if(ingredient.item.name === name) {
                                        var count = numbersOnly(value) || 1;
                                        self.renderedCraftCount = count / ingredient.count;
                                    }
                                }
                            }
                            break;
                        case "count":
                            var ingredientList = self.ingredientList;
                            for(var i = 0; i < ingredientList.length; i++) {
                                var ingredient = ingredientList[i];
                                if(ingredient.name === name) {
                                    self.database.save("default");
                                    ingredient.count = numbersOnly(value);
                                    break;
                                }
                            }
                            break;
                        case "price":
                            var item = self.database.getItem(name);
                            if(item) {
                                self.database.save("default");
                                item.marketValue = numbersOnly(value);
                            }
                            break;
                        //case "tier":
                        //    var numVal = numbersOnly(value);
                        //    if(numVal == value) {
                        //        var ingredients = self.ingredientList;
                        //        for(var i = 0; i < ingredients.length; i++) {
                        //            var ingredient = ingredients[i];
                        //            if(ingredient.tag === name) {
                        //                ingredient.tier = numbersOnly(value);
                        //            }
                        //        }
                        //    }
                        //    break;
                        default:
                            console.error(`Unhandled input from ${inputType}`);
                            break;
                    }
                    self.database.updateData();
                    var ingredients = self.getAllIngredients();
                    console.log(ingredients.refiners);
                    self.ingredientVlist.setList(ingredients.refiners);
                    self.updateNode();
                }
            };
            var refinerOnInput = (e) => {
                var value = e.target.value;
                var node = getFirstParentWithClass(e.target, "virtual_list_item");
                if(node) {
                    var name = node.getAttribute("data-name");
                    var inputType = e.target.getAttribute("data-value_type");
                    switch(inputType) {
                        case "multiplier":
                            var refinerList = self.refinerList;
                            for(var i = 0; i < refinerList.length; i++) {
                                var refiner = refinerList[i];
                                console.log(refiner);
                                if(refiner.name === name && refiner.tier > 1) {
                                    var multipliers = self.refiner.multipliers;
                                    if(multipliers.length > refiner.tier - 2) {
                                        multipliers[refiner.tier - 2] = numbersOnly(value) / 100;
                                        self.database.save("default");
                                        break;
                                    }
                                }
                            }
                            break;
                        case "price":
                            var item = self.database.getItem(name);
                            if(item) {
                                item.marketValue = numbersOnly(value);
                                self.database.save("default");
                            }
                            break;
                    }
                    self.database.updateData();
                    var ingredients = self.getAllIngredients();
                    self.ingredientVlist.setList(ingredients.items);
                    self.updateNode();
                }
            };
            var miscOnChange = (e) => {
                var value = e.target.value;
                var inputType = e.target.getAttribute("data-value_type");
                switch(inputType) {
                    case "market_price":
                        self.marketValue = numbersOnly(value);
                        break;
                    case "xp":
                        self.xp = numbersOnly(value);
                        self.database.save("default");
                        break;
                    case "base_multiplier":
                        self.baseMultiplier = numbersOnly(value) / 100;
                        self.database.save("default");
                        break;
                    case "gear_multiplier":
                        if(self.skill) {
                            database.setGearMultiplier(self.skill, numbersOnly(value) / 100);
                            self.database.save("default");
                        }
                        break;
                    case "tags":
                        var tags = value.split(",");
                        for(var i = 0; i < tags.length; i++) tags[i] = tags[i].trim();
                        self.tags = tags;
                        for(var i = 0; i < tags.length; i++) nwTool.refresh();
                        self.database.save("default");
                        break;
                }
                self.database.updateData();
                self.updateNode();
            };
            var infoInputs = self.node.querySelectorAll(".item_info_misc input");
            for(var i = 0; i < infoInputs.length; i++) {
                var input = infoInputs[i];
                domEventListener.addEvent(input, "change", "info", miscOnChange);
            }
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            self.recipeVlist = SelectableList(cont.querySelector(".recipe_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .recipe_ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", onInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.tag);
                    var inject = {
                        name: item.tag,
                        tags: item.tags.join(","),
                        tier: item.tier,
                        count: item.count
                    };
                    injectHtml(itemNode, inject);
                },
                onNodeRemove: (itemNode) => {
                    console.error("remove", itemNode);
                    var inputs = itemNode.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.removeEventListener("input", onInput);
                    }
                },
            });
            var onItemSelect = (e, item, selectOptions) => {
                if(e.type === "dblclick" || e.type === "input") {
                    self.database.nwTool.renderItemRecipe(item.name);
                }
            };
            if(self.refinerVlist) self.refinerVlist.vlist.remove();
            self.refinerVlist = SelectableList(cont.querySelector(".refiner_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .refiner_ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", refinerOnInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.item.name);
                    var itemObj = self.database.getItem(item.item.name);
                    var addedMultiplier = 0;
                    for(var i = 0; i < self.refinerList.length; i++) {
                        var refiner = self.refinerList[i];
                        if(refiner.name === item.item.name) {
                            addedMultiplier = refiner.multiplier;
                        }
                    }
                    var multiplier = Math.round(addedMultiplier * 10000)/100;
                    var inject = {
                        name: `${item.item.name}${item.bestRefiner ? "*" : ""}`,
                        price: `$${(itemObj ? itemObj.marketValue : 0)}`,
                        multiplier: `${multiplier}%`,
                        //count: `${Math.floor(self.renderedCraftCount / (1 + addedMultiplier)*100)/100}`
                        count: `${Math.floor(self.renderedCraftCount * item.count * 100)/100}`
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: onItemSelect,
                onNodeRemove: (itemNode) => {
                    console.error("remove", itemNode);
                    var inputs = itemNode.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.removeEventListener("input", onInput);
                    }
                },
            });
            if(self.ingredientVlist) self.ingredientVlist.vlist.remove();
            self.ingredientVlist = SelectableList(cont.querySelector(".ingredients_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", onInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.item.name);
                    var count = roundTo(item.count, {
                        decimals: 2
                    });
                    var inject = {
                        name: item.item.name,
                        craft_price: `$${formatNumber(item.count * item.item.cheapestValue * self.renderedCraftCount) + (item.item.isMarketCheaper ? "*" : "")}`,
                        price: `$${formatNumber(item.item.marketValue)}`,
                        count: Math.floor(count * self.renderedCraftCount * 100) / 100
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: onItemSelect,
            });
            if(self.usedInVlist) self.usedInVlist.vlist.remove();
            self.usedInVlist = SelectableList(cont.querySelector(".used_in_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .used_in").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    var count = roundTo(item.count, {
                        decimals: 2
                    });
                    var inject = {
                        name: item.name,
                        count: count
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: onItemSelect,
            });
            return cont;
        }
    };
    return self;
}

function NWDatabase(nwTool) {
    var self;
    self = {
        itemMap: {},
        tagMap: {},
        skillMap: {},
        nwTool: nwTool,
        addItem: (itemName, itemOptions) => {
            var item = NWItem(itemName, self, itemOptions);
            self.itemMap[itemName] = item;
            return item;
        },
        removeItem: (itemName) => {
            var item = self.getItem(itemName);
            if(item) item.remove();
        },
        setMarketValue: (itemName, marketValue) => {
            var item = self.itemMap[itemName];
            if(item) item.setMarketValue(marketValue);
        },
        getSkill: (skillName) => {
            if(!self.skillMap[skillName]) {
                self.skillMap[skillName] = {
                    "rewards": {

                    }
                }
            }
            var skill = self.skillMap[skillName];
        },
        updateData: () => {
            var keys = Object.keys(self.itemMap);
            for(var i = 0; i < keys.length; i++) {
				var itemName = keys[i];
                var item = self.itemMap[itemName];
                var tags = item.tags;
                for(var j = 0; j < tags.length; j++) {
                    var tag = tags[j];
                    self.tagMap[tag] = self.tagMap[tag] || [];
                    var list = self.tagMap[tag];
                    if(list.indexOf(item.name) === -1) {
                        list.push(item.name);
                    }
                }
            }
            var updatedMap = {};
            for(var tier = 0; tier < 10; tier++) {
                var tag = `t${tier}`;
                var list = self.tagMap[tag];
                if(list) {
                    for(var i = 0; i < list.length; i++) {
                        var itemName = list[i];
                        var item = self.getItem(itemName);
                        item.updateCraftValue();
                        updatedMap[itemName] = true;
                    }
                }
            }
            for(var i = 0; i < keys.length; i++) {
                var item = self.itemMap[keys[i]];
                if(!updatedMap[item.name]) {
                    item.updateCraftValue();
                    updatedMap[itemName] = true;
                }
            }
        },
        getBestItemWithTags: (tags) => {
            var cheapestItem = null;
			var items = {};
			if(tags.length) {
				var list = [];
				for(var i = 0; i < tags.length; i++) {
					var newList = self.tagMap[tags[i]];
					if(newList && (newList.length < list.length || list.length === 0)) {
						list = newList;
						if(!list) console.error(newList, tags[i]);
					}
				}
				for(var i = 0; i < list.length; i++) {
					var itemName = list[i];
					var item = self.getItem(itemName);
					if(!item) continue;

					items[itemName] = item;
				}
			}
			var keys = Object.keys(items);
			for(var i = 0; i < keys.length; i++) {
				var itemName = keys[i];
				var item = items[itemName];
				for(var j = 0; j < tags.length; j++) {
					var tag = tags[j];
					if(item.tags.indexOf(tag) !== -1) {
						continue;
					}

					items[itemName] = false;
					break;
				}
			}
            for(var i = 0; i < keys.length; i++) {
				var itemName = keys[i];
				var item = items[itemName];
				if(!item) continue;

                if(cheapestItem === null || item.cheapestValue < cheapestItem.cheapestValue) {
                    cheapestItem = item;
                }
            }
            return cheapestItem;
        },
        getTagList: (tag) => {
            var list = [];
            if(self.tagMap[tag]) list = self.tagMap[tag]
            return list;
        },
        getItem: (itemName) => {
            return self.itemMap[itemName];
        },
        resetToDefault: () => {
            self.loadFromJson(DEFAULT_DATABASE, {
                autoRenderItem: nwTool.currentRenderedItem
            });
            self.save("default");
            console.log("Loaded the default database");
        },
        getSkillMultiplier: (skill) => {
            var multiplier = 0;
            var skill = self.skillMap[skill];
            if(skill) {
                multiplier = skill.multiplier || 0;
            }
            return multiplier;
        },
        getAptitudeXp: (skill) => {
            var xp = 0;
            var skill = self.skillMap[skill];
            if(skill) {
                xp = skill.aptitude_chest_xp || 0;
            }
            return xp;
        },
        getAptititudeDiscount: (skill, xp) => {
            var discount = 0;
            var skill = self.skillMap[skill];
            if(skill) {
                var perc = xp / skill.aptitude_chest_xp;
                var chestsValue = 0;
                var chests = Object.keys(skill.chests);
                var chestCount = chests.length;
                var mult = 3 / chestCount;
                for(var i = 0; i < chests.length; i++) {
                    var chest = skill.chests[chests[i]];
                    var keys = Object.keys(chest.guaranteed);
                    for(var j = 0; j < keys.length; j++) {
                        var itemName = keys[j];
                        var item = self.getItem(itemName);
                        if(!item) {
                            console.log(`Aptitude item "${itemName} not found`);
                            continue;
                        }
                        if(!item.marketValue) {
                            console.log(`Aptitude item "${itemName} market value not set`);
                            continue;
                        }

                        discount += chest.guaranteed[keys[j]] * item.marketValue * mult;
                    }
                    keys = Object.keys(chest.chance);
                    for(var j = 0; j < keys.length; j++) {

                    }
                }
                discount *= perc;
            }
            return discount;
        },
        setGearMultiplier: (skillName, multiplier) => {
            var skill = self.skillMap[skillName];
            if(skill) {
                skill.multiplier = multiplier || 0;
            }
        },
        syncDatabases: (db) => {
            if(db.items) {
                var defaultKeys = Object.keys(db.items);
                for(var i = 0; i < defaultKeys.length; i++) {
                    var key = defaultKeys[i];
                    var item = db.items[key];
                    var dbItem = self.getItem(key);
                    if(!dbItem) {
                        console.log(`Added a new item "${key}" from the default database`);
                        dbItem = self.loadItemFromJson(key, item);
                    }
                    else {
						if(item.ingredients) {
	                        dbItem.setIngredients(item.ingredients);
	                    }
	                    dbItem.setTags(item.tags ? item.tags : []);
	                    if(item.refiner) {
	                        dbItem.setRefiner(item.refiner.tag, item.refiner.multipliers);
	                    }
						else {
	                        dbItem.removeRefiner();
						}
					}
                    dbItem.setSkill(item.skill);
                    if(typeof item.baseMultiplier !== "undefined") {
						console.log(item);
						dbItem.setBaseMultiplier(item.baseMultiplier);
					}
                    if(typeof item.xp !== "undefined") dbItem.setXp(item.xp);
                    if(typeof item.skill !== "undefined") dbItem.setSkill(item.skill);
                }
            }
            if(db.prices) {
                var priceKeys = Object.keys(db.prices);
                for(var i = 0; i < priceKeys.length; i++) {
                    var key = priceKeys[i];
                    var dbItem = self.getItem(key);
                    if(dbItem) {
                        if(dbItem.marketValue === 0) {
                            dbItem.setMarketValue(db.prices[key]);
                        }
                    }
                }
            }
            if(db.skills) {
                var skills = Object.keys(db.skills);
                for(var i = 0; i < skills.length; i++) {
                    var skillName = skills[i];
                    self.skillMap[skillName] = self.skillMap[skillName] || {};
                    var dbSkill = self.skillMap[skillName];
                    var skill = db.skills[skillName];
                    dbSkill.aptitude_chest_xp = skill.aptitude_chest_xp || 0;
                    dbSkill.chests = skill.chests;
                    if(typeof dbSkill.multiplier === "undefined") {
                        var multiplier = skill.multiplier;
                        if(typeof multiplier !== "undefined") {
                            dbSkill.multiplier = multiplier;
                        }
                    }
                }
            }
        },
        loadItemFromJson: (name, item) => {
            var dbItem = self.addItem(name);
            if (item.ingredients) {
                dbItem.setIngredients(item.ingredients);
            }
            if(item.refiner) dbItem.setRefiner(item.refiner.tag, item.refiner.multipliers);
            if(typeof item.tags !== "undefined") dbItem.addTags(item.tags);
            return dbItem;
        },
        loadFromJson: (db, options) => {
            options = options || {};
            var keys = Object.keys(self.itemMap);
            for(var i = 0; i < keys.length; i++) {
                self.itemMap[keys[i]].remove();
            }
            self.itemMap = {};
            self.tagMap = {};
            self.skillMap = {};
            if(db.items) {
                var keys = Object.keys(db.items);
                for(var i = 0; i < keys.length; i++) {
                    var name = keys[i];
                    self.loadItemFromJson(name, db.items[name]);
                }
                if(options.autoRenderItem) self.nwTool.renderItemRecipe(options.autoRenderItem);
            }
            if(db.prices) {
                var keys = Object.keys(db.prices);
                for(var i = 0; i < keys.length; i++) {
                    var name = keys[i];
                    var item = self.getItem(name);
                    if(!item) continue;

                    item.setMarketValue(toNumber(db.prices[keys[i]]));
                }
            }
            if(db.skills) {
                var skills = Object.keys(db.skills);
                for(var i = 0; i < skills.length; i++) {
                    var skillName = skills[i];
                    self.skillMap[skillName] = self.skillMap[skillName] || {};
                    var skill = db.skills[skillName];
                    var multiplier = skill.multiplier;
                    if(typeof multiplier !== "undefined") {
                        self.skillMap[skillName].multiplier = multiplier;
                    }
                }
            }
        },
        exportToJson: () => {
            var db = {
                items: {},
                prices: {},
                gear: {},
                skills: {}
            };
            var keys = Object.keys(self.itemMap);
            for(var i = 0; i < keys.length; i++) {
                var item = self.itemMap[keys[i]];
                db.items[item.name] = item.exportToJson();
            }
            for(var i = 0; i < keys.length; i++) {
                var item = self.itemMap[keys[i]];
                if(item.marketValue) {
                    db.prices[item.name] = item.marketValue;
                }
            }
            keys = Object.keys(self.skillMap);
            for(var i = 0; i < keys.length; i++) {
                var skill = keys[i];
                db.skills[skill] = self.skillMap[skill];
            }
            return db;
        },
        save: (databaseName) => {
            var databases = webStorage.loadKey("databases");
            databases = databases || {};
            databases[databaseName] = self.exportToJson();
            webStorage.saveKey("databases", databases);
        }
    };
    return self;
}

function formatItemName(name) {
    var arr = name.split("_");
    for(var i = 0; i < arr.length; i++) arr[i][0].toUpperCase();
    return arr.join(" ");
}

function NWTool() {
    var self;
    var rawDataDebouncer = null;
    self = {
        disableEvents: false,
        tabNav: TabNav({
            onTabChange: (url) => {
                if(url === "recipes") {
                    if(self.currentRenderedItem) {
                        var item = self.database.getItem(self.currentRenderedItem);
                        if(item) {
                            item.updateNode();
                        }
                    }
                }
                else if(url === "raw") {
                    var str = JSON.stringify(self.database.exportToJson(), null, 4);
                    //appendText(div, str);
                    self.disableEvents = true;
                    self.rawDataExport.innerHTML = str;
                    self.disableEvents = false;
                }
            }
        }),
        getDatabaseList: () => {
            var databases = webStorage.loadKey("databases");
            var list = [];
            if(databases) list = Object.keys(databases);
            list.sort(stringCompare);
            return list;
        },
        populateDatabaseSelect: () => {
            var select = self.databaseSelect;
            var selectOptions = [];
            var databases = self.getDatabaseList();
            var hasDefault = false;
            for(var i = 0; i < databases.length; i++) {
                if(databases[i] === "default") {
                    hasDefault = true;
                    break;
                }
            }
            if(!hasDefault) databases.push("default");
            var selectOptions = [];
            for(var i = 0; i < databases.length; i++) {
                selectOptions.push({
                    text: databases[i],
                    value: databases[i]
                });
            }
            var styledSelect = StyledSelect(select);
            styledSelect.setList(selectOptions);
            styledSelect.setValue(selectOptions[0].value);
        },
        onLoad: () => {
            self.tabNav.setupBindings();
            self.tabNav.selectDefaultTab();
            self.listSearchInput = document.querySelector(".list_search_input");
            self.databaseSelect = document.querySelector(".database_select");
            self.rawDataExport = document.querySelector(".raw_data_export")
            var options = webStorage.loadKey("options") || {};
            var dbName = options.currentSelectedDatabase || "default";
            var databases = webStorage.loadKey("databases");
            if(databases && databases[dbName]) {
                self.database.loadFromJson(databases[dbName]);
                self.database.syncDatabases(DEFAULT_DATABASE);
            }
            else {
                self.database.loadFromJson(DEFAULT_DATABASE);
            }
            self.database.save("default");
            //self.populateDatabaseSelect();
            self.setupBindings();
            self.populateRecipeList();

            nwTool.refresh();
        },
        refresh: ()=> {
            for(var i = 0; i < 3; i++) self.database.updateData(); // Update a few times to let prices settle
            //self.populateList(1);
            if(self.currentRenderedItem) {
                var item = self.database.getItem(self.currentRenderedItem);
                item.updateNode();
            }
        },
        populateRecipeList: () => {
            var filter = self.listFilter || "";
            var db = self.database;
            var keys = Object.keys(db.itemMap);
            keys.sort(stringCompare);
            var selectOptions = [];
            for(var i = 0; i < keys.length; i++) {
                var name = keys[i];
                var formattedName = formatItemName(name);
                if(!filter || name.toLowerCase().indexOf(filter) !== -1 || formattedName.toLowerCase().indexOf(filter) !== -1) {
                    selectOptions.push({
                        text: formatItemName(keys[i]),
                        value: name
                    });
                }
            }
            if(!self.recipeList) {
                var recipeList = document.getElementById("recipe_list");
                if(recipeList) {
                    self.recipeList = SelectableList(recipeList, {
                        onFillNode: (itemNode, item, idx) => {
                            appendText(itemNode, item.text);
                        },
                        onItemSelect: (e, item, selectOptions) => {
                            self.renderItemRecipe(item.value);
                        }
                    });
                }
            }
            self.recipeList.setList(selectOptions);
        },
        renderItemRecipe: (itemName) => {
            self.currentRenderedItem = null;
            var item = self.database.getItem(itemName);
            if(item) {
                var cont = document.querySelector(".tab_recipes");
                if(cont) {
                    removeAllChildren(cont);
                    var node = item.generateNode();
                    item.updateNode();
                    cont.appendChild(node);
                    self.currentRenderedItem = item.name;
                }
            }
        },
        setupBindings: () => {
            self.databaseSelect.addEventListener("change", (e) => {
                console.log(`Changed db to ${getSelectValue(self.databaseSelect)}`);
            });
            self.rawDataExport.addEventListener("input", (e) => {
                clearTimeout(rawDataDebouncer);
                rawDataDebouncer = setTimeout(() => {
                    console.log("changed");
                    if(!self.disableEvents) {
                        console.log(`New raw data`);
                        var json = null;
                        try {
                            console.log(self.rawDataExport.textContent);
                            json = JSON.parse(self.rawDataExport.textContent);
                        }
                        catch(e) {
                            console.error(`Failed to parse json of new raw data`);
                        }
                        if(json) {
                            self.database.loadFromJson(json, {
                                autoRenderItem: nwTool.currentRenderedItem
                            });
                        }
                    }
                }, 700);
            });
            self.listSearchInput.addEventListener("input", (e) => {
                var value = self.listSearchInput.value;
                self.listFilter = value;
                self.populateRecipeList();
            });
        }
    };
    self.database = NWDatabase(self);
    return self;
}

var nwTool = NWTool();

function loadDefaults() {
}

window.addEventListener('load', () => {
    nwTool.onLoad();
    console.log(nwTool);
    //var vlist = ValueVirtualList(document.querySelector(".vlist_test", {
    //}));
    //vlist.reflow();
    //setTimeout(() => {
    //    var db = nwTool.database;
    //    console.log("Loaded");
    //    var json = db.exportToJson();
    //    db.loadFromJson(json, {
    //        autoRenderItem: nwTool.currentRenderedItem
    //    });
    //    nwTool.refresh();
    //}, 300);
});

