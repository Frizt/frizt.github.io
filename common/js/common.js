"use strict";

var msPerFrame = 33.33;
var refreshRate = 60;

function nodeIsVisible(node) {
    return node.offsetHeight !== 0;
}

function numbersOnly(str) {
    if(typeof str === "string") {
        return str.replace(/[^\d.-]/g, '');
    }
    else return str;
}

function toNumber(str) {
    var num = parseFloat(numbersOnly(str));
    if(num != str) num = 0;
    return num;
}

function getRefreshRate() {
    var iterations = 0;
    var startTime = 0;
    var testRefreshRate = () => {
        if(iterations === 0) startTime = new Date().getTime();
        iterations++;
        if(iterations < 60) {
            requestAnimationFrame(testRefreshRate);
        }
        else {
            var time = new Date().getTime();
            var diff = time - startTime;
            msPerFrame = Math.min(diff / iterations, 33.33);
            refreshRate = Math.min(1000 / msPerFrame, 30);
        }
    };
    requestAnimationFrame(testRefreshRate);
}
getRefreshRate();

function WebStorage() {
    var self;
    self = {
        saveKey: (key, object) => {
            var result = false;
            try {
                localStorage[key] = JSON.stringify(object);
                result = true;
            } catch(e) {}
            return result;
        },
        deleteKey: (key) => {
            var result = false;
            try {
                delete localStorage[key];
            } catch(e) {}
            return result;
        },
        loadKey: (key) => {
            var data = null;
            try {
                data = JSON.parse(localStorage[key]);
            } catch(e) {}
            return data;
        }
    };
    return self;
}

function removeAllChildren(node) {
    while(node.children.length) node.removeChild(node.children[0]);
}

function removeFromParent(node) {
    if(node.parentNode) node.parentNode.removeChild(node);
}

function stringCompare(s1, s2) {
    return s1.localeCompare(s2);
}

function appendText(node, text, appendOnly) {
    if(!appendOnly) {
        node.textContent = text;
    }
    else {
        node.appendChild(document.createTextNode(text));
    }
}

function appendTextToSelector(node, selector, text) {
    var appendTo = node.querySelector(selector);
    if(appendTo) {
        appendText(appendTo, text !== null ? text : "");
    }
}

function getSelectValue(node) {
    return node.selectedIndex > -1 ? node.options[node.selectedIndex].value : "";
}

function getSelectText(node) {
    return node.selectedIndex > -1 ? node.options[node.selectedIndex].text : "";
}

function setSelectValue(node, value) {
    for(var i = 0; i < node.options.length; i++) {
        var option = node.options[i];
        if(option.value !== value) continue;
        node.selectedIndex = i;
        node.value = value;
        break;
    }
}

function setupSvgDef(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("xlink:href", `#${id}`);
    u.setAttribute("href", `#${id}`);
    svg.appendChild(u);
    return svg;
}

function appendNodes(appendTo, nodes) {
    var docFrag = new DocumentFragment();
    for(var i = 0; i < nodes.length; i++) {
        docFrag.appendChild(nodes[i]);
    }
    appendTo.appendChild(docFrag);
}

function addChildAfter(node, newNode) {
    node.parentNode.insertBefore(newNode, node.nextSibling);
}

function setupSelect(select, options) {
    removeAllChildren(select);
    var nodes = [];
    for(var i = 0; i < options.length; i++) {
        var optionNode = document.createElement("option");
        optionNode.value = options[i].value;
        appendText(optionNode, options[i].text);
        nodes.push(optionNode);
    }
    appendNodes(select, nodes);
}

function getParentsWithClass(child, cl, options) {
    options = options || {};
    var parents = [];
    var parent = options.includeChild ? child : child.parentNode;
    while(parent && parent.classList) {
        if(parent.classList.contains(cl)) parents.push(parent);
        parent = parent.parentNode;
    }
    return parents;
}

function getFirstParentWithClass(child, cl, options) {
    var parents = getParentsWithClass(child, cl, options);
    return parents.length > 0 ? parents[0] : null;
}

function mergeObjects(target, source) {
    var srcKeys = Object.keys(source);
    for(var i = 0; i < srcKeys.length; i++) {
        target[srcKeys[i]] = source[srcKeys[i]];
    }
}

function getNodeBounds(node) {
    var styles = window.getComputedStyle(node);
    var margin = parseFloat(styles['marginTop']) +
        parseFloat(styles['marginBottom']);

    var rect = node.getBoundingClientRect();
    rect.fullHeight = Math.ceil(node.offsetHeight + margin);
    return rect;
}

function smartScroll(node, scrollTo, options) {
    options = options || {};
    if(options.smart) {
        var top = node.scrollTop;
        var itemSize = options.itemSize || 0;
        var viewHeight = options.viewHeight || node.offsetHeight;
        if((!options.allowClipping && top > scrollTo) || (options.allowClipping && top - itemSize > scrollTo)) {
            node.scrollTop = scrollTo;
        }
        else if((!options.allowClipping && top + viewHeight - itemSize <= scrollTo) || (options.allowClipping && top + viewHeight <= scrollTo)) {
            node.scrollTop = scrollTo - viewHeight + itemSize;
        }
    }
    else {
        node.scrollTop = scrollTo;
    }
}

function anchorNodeToNode(anchorNode, node, options) {
    var anchorBounds = anchorNode.getBoundingClientRect();
    var nodeBounds = node.getBoundingClientRect();
    var viewport = getViewportSize();
    if(!options.keepOnScreen || anchorBounds.bottom + nodeBounds.height < viewport.height) {
        node.style.top = "100%";
        node.style.bottom = "";
    }
    else {
        node.style.top = "";
        node.style.bottom = "100%";
    }
}

function VirtualList(inCont, options) {
    var options = options || {};
    var reflowRaf = null;
    var reflowScroll = 0;
    var reflowScrollOptions = {};
    var scrolled = false;
    var listCont = document.createElement("div");
    var scrollWrapper = document.createElement("div");
    listCont.classList.add("virtual_list_body");
    listCont.style.position = "relative";
    scrollWrapper.appendChild(listCont);
    var self;
    self = {
        data: [],
        cont: inCont,
        listCont: listCont,
        height: 0,
        viewHeight: 0,
        hiddenNodes: [],
        visibleNodes: {},
        buffer: 3,
        getRowHeight: options.getRowHeight,
        getNodeCount: options.getNodeCount,
        getItem: options.getItem,
        getCleanNode: () => {
            var node = null;
            if(self.hiddenNodes.length > 0) {
                node = self.hiddenNodes[0];
                self.hiddenNodes.splice(0, 1);
            }
            else {
                node = self.onCreateNode();
                node.style.position = "absolute";
                //node.style.height = `${self.getRowHeight()}px`;
            }
            return node;
        },
        getNodesInView: () => {
            var nodes = [];
            var rowCount = self.getNodeCount();
            var rowHeight = self.getRowHeight();
            var topIdx = Math.floor(reflowScroll / rowHeight);
            for(var i = 0; i < Math.floor(self.viewHeight / rowHeight) + 1 + self.buffer * 2; i++) {
                var idx = topIdx + i - self.buffer;
                if(idx < 0) continue;
                if(idx >= rowCount) break;
                nodes.push(idx);
            }
            return nodes;
        },
        reflowItem: (idx) => {
            if(self.visibleNodes[idx]) {
                var node = self.visibleNodes[idx].node;
                node.style.display = "none";
                delete self.visibleNodes[idx];
                self.hiddenNodes.push(node);
            }
            self.reflow();
        },
        reflow: (reflowOptions) => {
            reflowOptions = reflowOptions || {};
            if(reflowRaf !== null) cancelAnimationFrame(reflowRaf);
            reflowRaf = requestAnimationFrame(() => {
                var nodeCount = self.getNodeCount();
                var rowHeight = self.getRowHeight();
                self.viewHeight = self.cont.offsetHeight;
                if(scrolled) {
                    reflowScrollOptions.viewHeight = self.viewHeight;
                    reflowScrollOptions.itemSize = rowHeight;
                    smartScroll(scrollWrapper, reflowScroll, reflowScrollOptions);
                    scrolled = false;
                    reflowScroll = scrollWrapper.scrollTop;
                }
                self.height = nodeCount * rowHeight;
                self.listCont.style.height = `${self.height}px`;

                var startTime = new Date().getTime();
                var time = startTime;
                var maxTime = msPerFrame * 1.3;

                var visibleNodes = self.getNodesInView();
                var newVisibleNodeMap = {};
                for(var i = 0; i < visibleNodes.length; i++) {
                    var idx = visibleNodes[i];
                    newVisibleNodeMap[idx] = 1;
                }
                var keys = Object.keys(self.visibleNodes);
                for(var i = 0; i < keys.length; i++) {
                    var idx = keys[i];
                    if(!newVisibleNodeMap[idx] || reflowOptions.forceNodeRefresh) {
                        var node = self.visibleNodes[idx].node;
                        node.style.display = "none";
                        delete self.visibleNodes[idx];
                        self.hiddenNodes.push(node);
                    }
                    time = new Date().getTime();
                    if(time - startTime >= maxTime) break;
                }
                var newNodes = [];
                for(var i = 0; i < visibleNodes.length; i++) {
                    var idx = visibleNodes[i];
                    if(!self.visibleNodes[idx] || reflowOptions.forceUpdate) {
                        var item = self.getItem(idx);
                        if(item !== null) {
                            var node;
                            if(!self.visibleNodes[idx]) {
                                node = self.getCleanNode();
                                self.visibleNodes[idx] = {
                                	node: node
                                };
                            }
                            else {
                                node = self.visibleNodes[idx].node;
                            }
                            node.style.display = "";
                            self.onFillNode(node, item, idx);
                            node.style.top = `${idx * rowHeight}px`;
                            if(node.parentNode !== self.listCont) {
                                newNodes.push(node);
                                self.listCont.appendChild(node);
                            }
                        }
                    }
                    time = new Date().getTime();
                    if(time - startTime >= maxTime) break;
                }
                appendNodes(self.listCont, newNodes);
                time = new Date().getTime();
                var diff = time - startTime >= maxTime;
                if(diff >= maxTime) {
                    console.log(`Took ${diff}ms to update, queuing another refresh`);
                    self.reflow(); //Queue another round of updates
                }
            });
        },
        onScroll: () => {
            scrolled = true;
            reflowScroll = scrollWrapper.scrollTop;
            self.reflow();
        },
        getScroll: () => {
            return reflowScroll;
        },
        setScroll: (scroll, scrollOptions) => {
            scrolled = true;
            scrollOptions = scrollOptions || {};
            reflowScrollOptions = scrollOptions;
            reflowScroll = Math.min(self.height - 1, Math.max(0, scroll));
            self.reflow();
        },
        scrollToIdx: (idx, scrollOptions) => {
            self.setScroll(idx * self.getRowHeight(), scrollOptions);
        },
        onCreateNode: () => {
            if(options.onCreateNode) return options.onCreateNode();
            var node = document.createElement("div");
            node.classList.add("virtual_list_item");
            return node;
        },
        onFillNode: (itemNode, item, idx) => {
            if(options.onFillNode) return options.onFillNode(itemNode, item, idx);
            appendText(itemNode, item);
        },
        onNodeDelete: (itemNode, item, idx) => {

        },
        pointToIdx: (xPos, yPos) => {
            return Math.floor(yPos / self.getRowHeight());
        },
        pointToItem: (xPos, yPos) => {
            return self.getItem(self.pointToIdx(xPos, yPos));
        },
        idxToItem: (idx) => {
            return self.getItem(idx);
        },
        idxToNode: (idx) => {
            var node = null;
            if(self.visibleNodes[idx]) node = self.visibleNodes[idx].node;
            return node;
        },
        remove: (removeOptions) => {
            if(options.onNodeRemove) {
                var keys = Object.keys(self.visibleNodes);
                for(var i = 0; i < keys.length; i++) {
                    var item = self.visibleNodes[keys[i]];
                    options.onNodeRemove(item.node);
                }
                for(var i = 0; i < self.hiddenNodes.length; i++) {
                    options.onNodeRemove(item.node);
                }
            }
            removeOptions = removeOptions || {};
            domEventListener.removeEvent(scrollWrapper, "scroll", "vlist");
            if(options.onRemove) options.onRemove(removeOptions);
            if(removeOptions.removeFromParent) {
                removeFromParent(self.cont);
            }
        }
    };
    var node = self.getCleanNode();
    node.style.opacity = 0;
    node.style.flexGrow = 1;
    node.style.position = "";
    node.style.pointerEvents = "none";
    node.style.maxHeight = "1px";
    node.classList.add("width_template");
    listCont.appendChild(node);
    if(!self.getRowHeight) {
        self.getRowHeight = () => {
            if(!self.heightRow) {
                node = self.getCleanNode();
                node.style.pointerEvents = "none";
                node.style.opacity = 0;
                node.style.position = "absolute";
                node.classList.add("size_template");
                listCont.appendChild(node);
                self.heightRow = node;
            }
            var rect = getNodeBounds(self.heightRow);
            return rect.fullHeight;
        };
    }
    domEventListener.addEvent(scrollWrapper, "scroll", "vlist", self.onScroll);
    if(!self.getNodeCount) console.error("VirtualList: Node count not implemented", self.cont);
    if(!self.getItem) console.error("VirtualList: Get item not implemented", self.cont);
    self.cont.classList.add("virtual_list");
    self.cont.appendChild(scrollWrapper);
    return self;
}

function ValueVirtualList(inCont, options) {
    options = options || {};
    var vlist;
    var self;
    self = {
        list: [],
        getItem: (idx) => {
            return self.list[idx];
        },
        getNodeCount: () => {
            return self.list.length;
        },
        setList: (newList) => {
            self.list = newList;
            vlist.reflow({
                forceNodeRefresh: true
            });
        },
        toggleListDisplay: (toggle) => {
            vlist.cont.style.display = toggle ? "" : "none";
        },
        listIsVisible: () => {
            return nodeIsVisible(vlist.cont);
        }
    };

    if(options.getItem) self.getItem = options.getItem;
    options.getItem = self.getItem;
    if(options.getNodeCount) self.getNodeCount = options.getNodeCount;
    options.getNodeCount = self.getNodeCount;

    vlist = VirtualList(inCont, options);
    vlist.valueVirtualList = self;
    return vlist;
}

function roundTo(number, options) {
    options = options || {};
    var decimals = options.decimals || 2;
    var divisor = 1;
    for(var i = 0; i < decimals; i++) {
        divisor *= 10;
    }
    return Math.round(number * divisor) / divisor;
}

function formatNumber(number, options) {
    options = options || {};
    if(!options.style) options.style = "metric";
    var divisors = [1, ""];
    var suffix = "";
    switch(options.style) {
        case "metric":
            divisors = [1000, "k"];
            break;
        default:
            console.log(`Unrecognized style "${options.style}"`);
            return;
    }
    var suffix = "";
    for(var i = divisors.length - 1; i >= 0; i--) {
        var divisor = divisors[i];
        if(number > divisor[0]) {
            number /= divisor[0];
        }
    }
    number = roundTo(number, {
        decimals: options.decimals || 2
    });
    return number + suffix;
}

function SelectableList(node, options) {
    options = options || {};
    var self;
    var valueList = {};
    var noEvent = true;
    //if(!options.getRowHeight) {
    //	console.error("No getRowHeight passed in", node);
    //}

    node.setAttribute("tabindex", 1);
    node.classList.add("selectable_list");
    var disableMouseOver = false;
    var disableMouseOverTimeout = null;

    self = {
        eventId: 0,
        rowHeight: 16,
        cont: node,
        selectedIdx: 0,
        vlist: ValueVirtualList(node, {
            onCreateNode: options.onCreateNode,
            onFillNode: options.onFillNode,
            getRowHeight: options.getRowHeight,
            onRemove: () => {
                if(options.onRemove) options.onRemove();
                domEventListener.removeEvent(self.cont, "click", "styledSelect");
                domEventListener.removeEvent(self.cont, "keydown", "styledSelect");
                domEventListener.removeEvent(self.cont, "mouseover", "styledSelect");
            }
        }),
        selectItem: (idx, selectOptions) => {
            selectOptions = selectOptions || {};
            var node = self.vlist.idxToNode(self.selectedIdx);
            if(node) node.classList.remove("selected");
            self.selectedIdx = Math.max(0, Math.min(idx, self.vlist.valueVirtualList.getNodeCount() - 1));
            node = self.vlist.idxToNode(self.selectedIdx);
            if(node) node.classList.add("selected");
            if(typeof selectOptions.scrollTo !== "undefined" && selectOptions.scrollTo) {
                self.vlist.scrollToIdx(self.selectedIdx, {
                    smart: true,
                    allowClipping: selectOptions.allowClipping
                });
            }
        },
        selectPrevItem: () => {
            self.selectItem(self.selectedIdx - 1, {
                scrollTo: true
            });
        },
        selectNextItem: () => {
            self.selectItem(self.selectedIdx + 1, {
                scrollTo: true
            });
        },
        onMouseover: (e) => {
            if(!disableMouseOver) {
                var visible = self.vlist.valueVirtualList.listIsVisible();
                if(visible) {
                    var target = getFirstParentWithClass(e.target, "virtual_list_item", {
                        includeChild: true
                    });
                    if(target) {
                        var x = 0;
                        var y = target.offsetTop;
                        self.selectItem(self.vlist.pointToIdx(x, y), {
                            scrollTo: true,
                            allowClipping: true
                        });
                    }
                }
            }
        },
        onKey: (e) => {
            var isVisible = self.vlist.valueVirtualList.listIsVisible();
            switch(e.keyCode) {
                case 33: // pgup
                case 34: // pgdown
                    if(isVisible) {
                        var up = e.keyCode === 33;
                        var viewHeight = self.vlist.viewHeight;
                        var rowHeight = self.vlist.getRowHeight();
                        var idx = self.selectedIdx + Math.floor(viewHeight / rowHeight) * (up ? -1 : 1);
                        self.selectItem(idx, {
                            scrollTo: true
                        });
                    }
                    break;
                case 35: // end
                    if(isVisible) {
                        self.selectItem(self.vlist.valueVirtualList.getNodeCount(), {
                            scrollTo: true
                        });
                    }
                    break;
                case 36: // home
                    if(isVisible) {
                        self.selectItem(0, {
                            scrollTo: true
                        });
                    }
                    break;
                case 38: // keyup
                    if(isVisible) {
                        self.selectPrevItem();
                    }
                    break;
                case 40: // keydown
                    if(isVisible) {
                        self.selectNextItem();
                    }
                    break;
                case 13: // Enter
                    var visible = self.vlist.valueVirtualList.listIsVisible();
                    if(visible) {
                        var item = self.vlist.idxToItem(self.selectedIdx);
                        if(item) {
                            if(options.onItemSelect) options.onItemSelect(e, item);
                        }
                    }
                    break;
            }
            if(options.onKey) options.onKey(e);
            self.pauseMouseover();
        },
        setList: (values) => {
            self.vlist.valueVirtualList.setList(values);
        },
        pauseMouseover: () => {
            disableMouseOver = true;
            clearTimeout(disableMouseOverTimeout);
            disableMouseOverTimeout = setTimeout(() => {
                disableMouseOver = false;
            }, 200);
        },
        onClick: (e) => {
            var visible = self.vlist.valueVirtualList.listIsVisible();
            if(visible) {
                var target = getFirstParentWithClass(e.target, "virtual_list_item", {
                    includeChild: true
                });
                if(target) {
                    var item = self.vlist.pointToItem(target.offsetLeft, target.offsetTop);
                    if(item) {
                        if(options.onItemSelect) options.onItemSelect(e, item);
                        //self.cont.focus();
                    }
                }
                if(options.onClick) options.onClick(e);
            }
        },
        setList: (values) => {
            self.vlist.valueVirtualList.setList(values);
        }
    };
    self.vlist.selectableList = self;
    domEventListener.addEvent(self.cont, "dblclick", "styledSelect", self.onClick);
    domEventListener.addEvent(self.cont, "click", "styledSelect", self.onClick);
    domEventListener.addEvent(self.cont, "keydown", "styledSelect", self.onKey);
    domEventListener.addEvent(self.cont, "mouseover", "styledSelect", self.onMouseover);
    noEvent = false;
    return self;
}

function getViewportSize() {
    return {
        width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
}

function StyledSelect(node, options) {
    options = options || {};
    var self;
    var valueList = {};
    var noEvent = true;
    var onChange = (e) => {
        if(!noEvent) {
            self.setValue(node.value, true);
        }
    };
    domEventListener.addEvent(node, "change", "styledSelect", onChange);
    node.style.display = "none";
    var styledSelectDiv = document.createElement("div");
    styledSelectDiv.className = node.getAttribute("data-styled_select_class") || "";
    styledSelectDiv.classList.add("styled_select");
    var valueDiv = document.createElement("div");
    styledSelectDiv.appendChild(valueDiv);
    var listDiv = document.createElement("div");
    listDiv.classList.add("styled_select_list");
    listDiv.style.display = "none";
    styledSelectDiv.appendChild(listDiv);
    var chevronDiv = document.createElement("div");
    chevronDiv.classList.add("styled_select_chevron");
    styledSelectDiv.appendChild(chevronDiv);
    var def = setupSvgDef("chevron");
    chevronDiv.appendChild(def);

    styledSelectDiv.setAttribute("tabindex", 1);
    listDiv.setAttribute("tabindex", 1);
    var disableMouseOver = false;
    var disableMouseOverTimeout = null;

    self = {
        eventId: 0,
        ignoreGlobal: false,
        rowHeight: 0,
        cont: styledSelectDiv,
        selectableList: SelectableList(listDiv, {
            onFillNode: (itemNode, item, idx) => {
                appendText(itemNode, item.text);
                if(self.selectableList.selectedIdx === idx) {
                    itemNode.classList.add("selected");
                }
                else {
                    itemNode.classList.remove("selected");
                }
            },
            //getRowHeight: () => {
            //	return self.rowHeight;
            //},
            onKey: (e) => {
                switch(e.keyCode) {
                    case 13: // Enter
                        var item = self.selectableList.vlist.idxToItem(self.selectableList.selectedIdx);
                        if(item) {
                            self.setValue(item.value);
                        }
                        self.hide();
                        self.cont.focus();
                        break;
                }
            },
            onClick: (e) => {
                self.cont.focus();
            },
            onItemSelect: (e, item) => {
                self.setValue(item.value);
                self.cont.focus();
            }
        }),
        onKey: (e) => {
            var isVisible = self.selectableList.vlist.valueVirtualList.listIsVisible();
            switch(e.keyCode) {
                case 38: // keyup
                case 40: // keydown
                    if(!isVisible) {
                        self.show();
                    }
                    break;
                case 13: // Enter
                    if(!isVisible) {
                        self.show();
                    }
                    else {
                        self.hide();
                        self.cont.focus();
                    }
                    break;
            }
            if(isVisible) self.selectableList.onKey(e);
        },
        onClick: (e) => {
            var visible = self.selectableList.vlist.valueVirtualList.listIsVisible();
            if(!visible) {
                self.show();
                self.ignoreGlobal = true;
            }
        },
        hide: () => {
            self.selectableList.vlist.valueVirtualList.toggleListDisplay(false);
            domEventListener.removeEvent(document, "click", self.eventId);
            self.eventId = 0;
            self.ignoreGlobal = false;
        },
        show: () => {
            self.selectableList.pauseMouseover();
            self.selectableList.vlist.scrollToIdx(self.selectableList.selectedIdx);
            self.selectableList.vlist.valueVirtualList.toggleListDisplay(true);
            anchorNodeToNode(self.cont, listDiv, {
                keepOnScreen: true
            });
            self.eventId = domEventListener.getUniqueEventNumber();
            domEventListener.addEvent(document, "click", self.eventId, (e) => {
                if(self.ignoreGlobal) {
                    self.ignoreGlobal = false;
                }
                else {
                    self.hide();
                }
            });
            self.selectableList.vlist.reflow();
        },
        setValue: (value) => {
            setSelectValue(node, value);
            appendText(valueDiv, getSelectText(node));
        },
        getValue: () => {
            return node.value;
        },
        setList: (values) => {
            valueList = {};
            setupSelect(node, values);
            for(var i = 0; i < values.length; i++) {
                var value = values[i];
                valueList[values.value] = value.text;
            }
            self.selectableList.vlist.valueVirtualList.setList(values);
        }
    };
    domEventListener.addEvent(self.cont, "click", "styledSelect", self.onClick);
    domEventListener.addEvent(self.cont, "keydown", "styledSelect", self.onKey);
    self.setValue(self.getValue());
    noEvent = false;
    requestAnimationFrame(() => {
        addChildAfter(node, styledSelectDiv);
        self.rowHeight = styledSelectDiv.offsetHeight - 2;
    });
    return self;
}

function SearchSelect(node, options) {
    var self = CustomSelect(node, options);
    return self;
}

function TabNav(options) {
    options = options || {};
    var self;
    function tabClickCallback(e) {
        var target = getFirstParentWithClass(e.target, "tabbable_button", {
            includeChild: true
        });
        console.log(e);
        self.setTabVisible(target.getAttribute("data-tabbable_group"), target.getAttribute("data-tabbable_name"));
    };
    self = {
        selectDefaultTab: () => {
            var tabItems = document.querySelectorAll(".tabbable_button[data-tabbable_default]");
            for(var i = 0; i < tabItems.length; i++) {
                var tab = tabItems[i];
                tab.classList.add("tabbable_selected");
                self.setTabVisible(tab.getAttribute("data-tabbable_group"), tab.getAttribute("data-tabbable_name"));
            }
        },
        setTabVisible: (tabGroup, tabName) => {
            var tabItems = document.querySelectorAll(`.tabbable_content[data-tabbable_group="${tabGroup}"], .tabbable_button[data-tabbable_group="${tabGroup}"]`);
            for(var i = 0; i < tabItems.length; i++) {
                var tab = tabItems[i];
                var isTab = tab.classList.contains("tabbable_button");
                tab.classList.toggle("tabbable_selected", tab.getAttribute("data-tabbable_name") === tabName);
            }
            history.pushState(null, tabName);
            self.onTabChange(tabName);
        },
        setTabFromUrl: (url) => {
            console.error("Not implemented");
            //var segments = url.split("/");
            //var tables
            //for(var i = 0; i < segments.length; i++) {
            //	var idx = segments.length - i - 1;
            //	var parentTabbables = getParentsWithClass(segments[i], "tabbable_button");
            //}
        },
        setupBindings: () => {
            var tabs = document.querySelectorAll(".tabbable_button");
            for(var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                domEventListener.addEvent(tab, "click", "tab", tabClickCallback);
            }
        },
        onTabChange: (url) => {
            if(options.onTabChange) options.onTabChange(url);
        }
    };
    return self;
}

function injectHtml(cont, inject, options) {
    options = options || {};
    var injectMethods = {
        "data-html": (node, html, injectOptions) => {
            appendText(node, html);
        },
        "data-value": (node, value, injectOptions) => {
            switch(node.tagName.toLowerCase()) {
                case "input":
                    node.value = value;
                    break;
                case "select":
                    setSelectValue(node, value);
            }
        }
    };
    var cache = cont.cachedNodeTree;
    if(!cache || options.forceCacheRebuild) {
        cache = cont.cachedNodeTree = {};
        var injectKeys = Object.keys(injectMethods);
        var nodes = [cont];
        while(nodes.length) {
            var node = nodes[0];
            for(var i = 0; i < node.children.length; i++) {
                nodes.push(node.children[i]);
            }
            for(var i = 0; i < injectKeys.length; i++) {
                var key = injectKeys[i];
                var injectMethod = injectMethods[key];
                var attr = node.getAttribute(key);
                if(attr !== null) {
                    cache[attr] = cache[attr] || {};
                    cache[attr][key] = cache[attr][key] || [];
                    cache[attr][key].push(node);
                }
            }
            nodes.splice(0, 1);
        }
    }
    var keys = Object.keys(cache);
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = inject[key];
        if(typeof val === "undefined") continue;

        var methodKeys = Object.keys(cache[keys[i]]);
        for(var j = 0; j < methodKeys.length; j++) {
            var methodKey = methodKeys[j];
            var method = injectMethods[methodKey];
            var nodes = cache[keys[i]][methodKey];
            for(var k = 0; k < nodes.length; k++) {
                var node = nodes[k];
                method(node, val);
            }
        }
    }
}

function DomEventListener() {
    var self;
    var uniqueNumber = 0;
    var nodeIdIncrementer = 0;
    self = {
        nodes: {},
        getUniqueEventNumber: () => {
            return ++uniqueNumber;
        },
        addEvent: (node, type, name, callback) => {
            if(!node.nodeId) node.nodeId = ++nodeIdIncrementer;
            var nodeId = node.nodeId;
            if(!callback) {
                callback = name;
                name = self.getUniqueEventNumber();
            }
            if(!self.nodes[nodeId]) self.nodes[nodeId] = {};
            if(!self.nodes[nodeId][type]) {
                self.nodes[nodeId][type] = {
                    listener: (e) => {
                        self.onEvent(e, node, type);
                    },
                    list: []
                };
                node.addEventListener(type, self.nodes[nodeId][type].listener);
            }
            var events = self.nodes[nodeId][type].list;
            var matched = false;
            for(var i = 0; i < events.length; i++) {
                var event = events[i];
                if(event.name !== name) continue;
                matched = true;
                console.error(`Double binded ${type} - ${name}`, node);
                event.callback = callback;
                break;
            }
            if(!matched) {
                events.push({
                    name: name,
                    callback: callback
                });
            }
        },
        removeEvent: (node, type, name) => {
            var nodeId = node.nodeId;
            if(typeof nodeId !== "undefined" && self.nodes[nodeId] && self.nodes[nodeId][type]) {
                var events = self.nodes[nodeId][type].list;
                if(events) {
                    for(var i = 0; i < events.length; i++) {
                        var event = events[i];
                        if(event.name !== name) continue;
                        events.splice(i, 1);
                        if(events.length === 0) {
                            node.removeEventListener(type, self.nodes[nodeId][type].listener);
                            delete self.nodes[nodeId][type];
                        }
                        break;
                    }
                }
            }
        },
        trigger: (node, type, name) => {
            if(node.nodeId) {
                if(self.node[nodeId]) {
                    var events = self.nodes[nodeId][type];
                    if(events) {
                        for(var i = 0; i < events.length; i++) {
                            var event = events[i];
                            if(event.name === name) {
                                event.callback(null);
                                break;
                            }
                        }
                    }
                }
            }
        },
        onEvent: (e, node, type) => {
            var nodeId = node.nodeId;
            if(nodeId && self.nodes[nodeId] && self.nodes[nodeId][type]) {
                var events = self.nodes[nodeId][type].list;
                var list = [];
                for(var i = 0; i < events.length; i++) list.push({
                    name: events[i].name,
                    callback: events[i].callback
                });
                for(var i = 0; i < list.length; i++) {
                    if(list[i].callback(e) === false) break;
                }
            }
        }
    };
    return self;
}

var domEventListener = DomEventListener();
