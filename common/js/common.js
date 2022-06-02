"use strict";

var msPerFrame = 33.33;
var refreshRate = 60;
if(typeof requestAnimationFrame === "undefined") {
    var requestAnimationFrame = requestAnimationFrame || function() {};
}

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

function VirtualList(inCont, options) {
    var options = options || {};
    var reflowRaf = null;
    var reflowScroll = 0;
    var reflowScrollOptions = {};
    var scrolled = false;
    var header = null;
    var listCont = document.createElement("div");
    var scrollWrapper = document.createElement("div");
    listCont.classList.add("virtual_list_body");
    listCont.style.position = "relative";
    scrollWrapper.appendChild(listCont);
    var self;
    self = {
        plugins: {},
        data: [],
        cont: inCont,
        listCont: listCont,
        height: 0,
        viewHeight: 0,
        hiddenNodes: [],
        visibleNodes: {},
        allNodes: [],
        buffer: 3,
        getCleanNode: () => {
            var node = null;
            if(self.hiddenNodes.length > 0) {
                node = self.hiddenNodes[0];
                self.hiddenNodes.splice(0, 1);
            }
            else {
                node = self.onCreateNode();
                node.classList.add("virtual_list_item");
                self.allNodes.push(node);
                node.style.position = "absolute";
                //node.style.height = `${self.getRowHeight()}px`;
            }
            node.topOfRow = null;
            return node;
        },
        getNodesInView: () => {
            var nodes = [];
            var rowCount = self.getNodeCount();
            var rowHeight = self.getRowHeight();
            if (rowHeight > 0) {
                var topIdx = Math.floor(reflowScroll / rowHeight);
                for(var i = 0; i < Math.floor(self.viewHeight / rowHeight) + 1 + self.buffer * 2; i++) {
                    var idx = topIdx + i - self.buffer;
                    if(idx < 0) continue;
                    if(idx >= rowCount) break;
                    nodes.push(idx);
                }
            }
            else {
                console.error("Warning: vlist row height is zero");
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
        injectRow: (node, top) => { // Keeps rows organized by their top so select works
            var beforeNode = null;
            var children = self.listCont.children;
            for(var i = 0; i < children.length; i++) {
                var child = children[i];
                if(top < child.topOfRow) {
                    beforeNode = child;
                    break;
                }
            }
            if(beforeNode !== null) {
                self.listCont.insertBefore(node, beforeNode);
            }
            else {
                self.listCont.appendChild(node);
            }
        },
        reflow: (reflowOptions) => {
            reflowOptions = reflowOptions || {};
            if(reflowRaf !== null) cancelAnimationFrame(reflowRaf);
            reflowRaf = requestAnimationFrame(() => {
                if(!self.headerRow) self.buildHeader();
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
                            node.virtualListVisibleIdx = idx;
                            self.onFillNode(node, item, idx);
                            var top = idx * rowHeight;
                            node.style.top = `${top}px`;
                            node.topOfRow = top;
                            self.injectRow(node, top);
                            newNodes.push(node);
                        }
                    }
                    time = new Date().getTime();
                    if(time - startTime >= maxTime) break;
                }
                for(var i = 0; i < newNodes.length; i++) {
                    newNodes[i].style.display = "";
                }
                time = new Date().getTime();
                var diff = time - startTime >= maxTime;
                if(diff >= maxTime) {
                    console.log(`Took ${diff}ms to update, queuing another refresh`);
                    self.reflow(); //Queue another round of updates
                }
                if(options.syncColumnWidths) self.syncRowSizes();
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
            return self.execEvent("onCreateNode");
        },
        onFillNode: (itemNode, item, idx) => {
            self.execEvent("onFillNode", itemNode, item, idx);
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
        syncRowSizes: () => {
            var widths = [];
            var minWidths = [];
            var percs = [];
            if(self.headerRow) {
                var total = 0;
                var children = self.headerRow.children;
                for(var i = 0; i < children.length; i++) {
                    var w = children[i].offsetWidth;
                    total += w;
                    widths.push(w);
                    minWidths.push(children[i].children[0].offsetWidth);
                }
                for(var i = 0; i < children.length; i++) {
                    percs.push(Math.round(widths[i] / total * 100));
                }
            }
            var children = self.heightRow.children;
            for(var i = 0; i < children.length; i++) {
                var width = children[i].offsetWidth;
                if(i >= widths.length) {
                    minWidths.push(width);
                    widths.push(width);
                }
                //else if(width > widths[i]) widths[i] = width;
            }
            for(var i = 0; i < self.allNodes.length; i++) {
                var node = self.allNodes[i];
                var children = node.children;
                for(var j = 0; j < children.length; j++) {
                    children[j].style.minWidth = minWidths[j];
                    children[j].style.maxWidth = percs[j] +"%";
                    children[j].style.width = percs[j] +"%";
                }
            }
        },
        remove: (removeOptions) => {
            removeOptions = removeOptions || {};
            var keys = Object.keys(self.visibleNodes);
            for(var i = 0; i < keys.length; i++) {
                var item = self.visibleNodes[keys[i]];
                self.execEvent("onNodeRemove", item.node);
            }
            for(var i = 0; i < self.hiddenNodes.length; i++) {
                self.execEvent("onNodeRemove", item.node);
            }
            domEventListener.removeEvent(scrollWrapper, "scroll", "vlist");
            self.execEvent("onRemove", removeOptions);
            if(removeOptions.removeFromParent) {
                removeFromParent(self.cont);
            }
        },
        buildHeader: () => {
            var header = self.execEvent("onBuildHeader");
            if(header) {
                header.classList.add("virtual_list_header");
                var columns = header.children;
                for(var i = 0; i < columns.length; i++) {
                    var column = columns[i];
                    var div = document.createElement("div");
                    div.innerHTML = column.innerHTML;
                    column.innerHTML = "";
                    column.appendChild(div);
                }
                if(self.headerRow) removeFromParent(self.headerRow);
                self.headerRow = header;
                self.allNodes.push(header);
                var children = self.cont.children;
                if(children.length)
                    self.cont.insertBefore(header, children[0]);
                else
                    self.cont.appendChild(header);

                self.reflow({
                    forceUpdate: true
                });
            }
        },
        events: {},
        addEvent: (eventName, pluginName, event) => {
            var e = {
                eventName: eventName,
                pluginName: pluginName,
                event: event
            };
            self.events[eventName] = self.events[eventName] || [];
            var eventList = self.events[eventName];
            for(var i = 0; i < eventList.length; i++) {
                if(eventList[i].pluginName === pluginName) {
                    eventList.splice(i, 1);
                    break;
                }
            }
            eventList.splice(0, 0, e);
        },
        execEvent: (eventName, ...args) => {
            var result = null;
            var events = self.events[eventName];
            if(events) {
                for(var i = 0; i < events.length; i++) {
                    var eResults = events[i].event.apply(this, args);
                    if(typeof eResults === "object") {
                        result = eResults.result;
                        if(typeof eResults.continue !== "undefined" && !eResults.continue)
                            break;
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                //console.error(`No event implemented for ${eventName}`, self);
            }
            return result;
        },
        listIsVisible: () => {
            return nodeIsVisible(self.cont);
        },
        toggleDisplay: (toggle) => {
            self.cont.style.display = toggle ? "" : "none";
            self.execEvent("toggleDisplay", toggle);
        },
        getItem: (idx) => {
            return self.execEvent("getItem", idx);
        },
        getNodeCount: () => {
            return self.execEvent("getNodeCount");
        },
        addPlugin: (pluginName, pluginData) => {
            if(self.hasPlugin(pluginName, true)) return false;
            self.plugins[pluginName] = pluginData;
            return true;
        },
        hasPlugin: (pluginName, throwErrorIfExists) => {
            var hasPlugin = !!self.plugins[pluginName];
            if(throwErrorIfExists && hasPlugin) {
                console.error(`Added plugin ${pluginName} twice`, vlist);
                return false;
            }
            return hasPlugin;
        }
    };
    self.addEvent("onFillNode", "default", (itemNode, item, idx) => {
        appendText(itemNode, item);
    });
    self.addEvent("onCreateNode", "default", () => {
        var node = document.createElement("div");
        return {
            continue: false,
            result: node
        };
    });

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
    self.cont.classList.add("virtual_list");
    self.cont.appendChild(scrollWrapper);
    return self;
}

function AddValueVirtualListPlugin(vlist, options) {
    if(vlist.hasPlugin("valueList", true)) return false;

    options = options || {};
    var self;
    self = {
        vlist: vlist,
        list: []
    };

    self.vlist.addPlugin("valueList", self);
    self.vlist.addEvent("setList", "valueList", (newList) => {
        self.list = newList;
        self.vlist.reflow({
            forceNodeRefresh: true
        });
        return { continue: false };
    });
    self.vlist.addEvent("getItem", "valueList", (idx) => {
        var item = null;
        if(idx >= 0 && idx < self.list.length) item = self.list[idx];
        return { result: item, continue: false };
    });
    self.vlist.addEvent("getNodeCount", "valueList", () => {
        return { result: self.list.length,  continue: false };
    });
    self.vlist.setList = (newList) => {
        self.vlist.execEvent("setList", newList);
    };
    return self.vlist;
}

function AddSelectableVirtualListPlugin(vlist, options) {
    if(vlist.hasPlugin("selectableList", true)) return false;

    options = options || {};
    var self;
    var valueList = {};

    var disableMouseOver = false;
    var disableMouseOverTimeout = null;

    self = {
        eventId: 0,
        rowHeight: 16,
        selectedIdx: 0,
        vlist: vlist,
        selectItem: (idx, selectOptions) => {
            selectOptions = selectOptions || {};
            var node = self.vlist.idxToNode(self.selectedIdx);
            if(node) node.classList.remove("selected");
            self.selectedIdx = Math.max(0, Math.min(idx, self.vlist.getNodeCount() - 1));
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
        onRowMouseover: (e) => {
            if(!disableMouseOver) {
                var visible = self.vlist.listIsVisible();
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
        onRowKey: (e) => {
            var isVisible = self.vlist.listIsVisible();
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
                        self.selectItem(self.vlist.getNodeCount(), {
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
                    var visible = self.vlist.listIsVisible();
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
        pauseMouseover: () => {
            disableMouseOver = true;
            clearTimeout(disableMouseOverTimeout);
            disableMouseOverTimeout = setTimeout(() => {
                disableMouseOver = false;
            }, 200);
        },
        onRowClick: (e) => {
            var visible = self.vlist.listIsVisible();
            if(visible) {
                var target = getFirstParentWithClass(e.target, "virtual_list_item", {
                    includeChild: true
                });
                if(target) {
                    var item = self.vlist.getItem(target.virtualListVisibleIdx);
                    if(item) {
                        if(options.onItemSelect) options.onItemSelect(e, item);
                    }
                }
                if(!target) {
                    target = getFirstParentWithClass(e.target, "virtual_list_header", {
                        includeChild: true
                    });
                    if(target) {
                        console.log("clicked on header");
                    }
                }
                if(options.onClick) options.onClick(e);
            }
        }
    };
    self.vlist.addPlugin("selectableList", self);

    self.vlist.cont.setAttribute("tabindex", 1);
    self.vlist.cont.classList.add("selectable_list");

    self.vlist.addEvent("onRemove", "selectableList", (idx) => {
        domEventListener.removeEvent(self.vlist.cont, "click", "styledSelect");
        domEventListener.removeEvent(self.vlist.cont, "keydown", "styledSelect");
        domEventListener.removeEvent(self.vlist.cont, "mouseover", "styledSelect");
    });
    domEventListener.addEvent(self.vlist.cont, "dblclick", "styledSelect", self.onRowClick);
    domEventListener.addEvent(self.vlist.cont, "click", "styledSelect", self.onRowClick);
    domEventListener.addEvent(self.vlist.cont, "keydown", "styledSelect", self.onRowKey);
    domEventListener.addEvent(self.vlist.cont, "mouseover", "styledSelect", self.onRowMouseover);
    return self.vlist;
}

function SelectableList(cont, options) {
    var vlist = VirtualList(cont, options);
    AddValueVirtualListPlugin(vlist);
    return AddSelectableVirtualListPlugin(vlist, options);
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

    var vlist = SelectableList(listDiv, {
        onFillNode: (itemNode, item, idx) => {
            appendText(itemNode, item.text);
            if(self.selectableList.selectedIdx === idx) {
                itemNode.classList.add("selected");
            }
            else {
                itemNode.classList.remove("selected");
            }
        },
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
    });

    self = {
        eventId: 0,
        ignoreGlobal: false,
        rowHeight: 0,
        cont: styledSelectDiv,
        vlist: vlist,
        dropdownOnKey: (e) => {
            var isVisible = self.vlist.listIsVisible();
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
            if(isVisible) self.vlist.plugins.selectableList.onKey(e);
        },
        dropdownOnClick: (e) => {
            var visible = self.vlist.listIsVisible();
            if(!visible) {
                self.show();
                self.ignoreGlobal = true;
            }
        },
        hide: () => {
            self.vlist.toggleListDisplay(false);
            domEventListener.removeEvent(document, "click", self.eventId);
            self.eventId = 0;
            self.ignoreGlobal = false;
        },
        show: () => {
            self.vlist.plugins.selectableList.pauseMouseover();
            self.vlist.scrollToIdx(self.selectableList.selectedIdx);
            self.vlist.toggleListDisplay(true);
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
            self.vlist.reflow();
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
            self.vlist.plugins.valueList.setList(values);
        }
    };
    domEventListener.addEvent(self.cont, "click", "styledSelect", self.dropdownOnClick);
    domEventListener.addEvent(self.cont, "keydown", "styledSelect", self.dropdownOnKey);
    self.setValue(self.getValue());
    self.vlist.plugins.styledSelect = self;
    noEvent = false;
    requestAnimationFrame(() => {
        addChildAfter(node, styledSelectDiv);
        self.rowHeight = styledSelectDiv.offsetHeight - 2;
    });
    return self.vlist;
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
        if(!target.getAttribute("data-tabbable_disabled")) {
            var group = target.getAttribute("data-tabbable_group");
            var name = target.getAttribute("data-tabbable_name");
            if(options.onClick) {
                if(options.onClick(e, group, name) === false) {
                    return;
                }
            }
            self.setTabVisible(group, name, e);
        }
    };
    self = {
        buttons: {},
        selectDefaultTab: () => {
            var tabItems = document.querySelectorAll(".tabbable_button[data-tabbable_default]");
            for(var i = 0; i < tabItems.length; i++) {
                var tab = tabItems[i];
                tab.classList.add("tabbable_selected");
                self.setTabVisible(tab.getAttribute("data-tabbable_group"), tab.getAttribute("data-tabbable_name"));
            }
        },
        toggleButton: (button, toggle) => {
            button.classList.toggle("disabled", !toggle);
            if(toggle) {
                button.removeAttribute("data-tabbable_disabled");
            }
            else {
                button.setAttribute("data-tabbable_disabled", "1");
            }
        },
        toggleButtons: (tabGroup, tabName, toggle) => {
            var buttons = document.querySelectorAll(`.tabbable_button[data-tabbable_group="${tabGroup}"]`);
            for(var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                var name = button.getAttribute("data-tabbable_name");
                if(name === tabName) {
                    self.toggleButton(button, toggle);
                }
            }
        },
        setTabVisible: (tabGroup, tabName, e) => {
            var tabItems = document.querySelectorAll(`.tabbable_content[data-tabbable_group="${tabGroup}"], .tabbable_button[data-tabbable_group="${tabGroup}"]`);
            for(var i = 0; i < tabItems.length; i++) {
                var tab = tabItems[i];
                var isTab = tab.classList.contains("tabbable_button");
                tab.classList.toggle("tabbable_selected", tab.getAttribute("data-tabbable_name") === tabName);
            }
            history.pushState(null, tabName);
            self.onTabChange(tabGroup, tabName, e);
        },
        setTabFromUrl: (url) => {
            console.error("Not implemented");
            //var segments = url.split("/");
            //var tables
            //for(var i = 0; i < segments.length; i++) {
            //  var idx = segments.length - i - 1;
            //  var parentTabbables = getParentsWithClass(segments[i], "tabbable_button");
            //}
        },
        setupBindings: () => {
            var tabs = document.querySelectorAll(".tabbable_button");
            for(var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                domEventListener.addEvent(tab, "click", "tab", tabClickCallback);
            }
        },
        onTabChange: (tabGroup, tabName, e) => {
            if(options.onTabChange) options.onTabChange(tabGroup, tabName, e);
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

function CSVToJson(csvText, options) {
    csvText = csvText.trim();
    options = options || {};
    var keys = [];
    var json = [];
    var lines = csvText.split("\n");
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var entry = {};
        var parts = line.split(options.delimiter || ",");
        if(i === 0) {
            for(var j = 0; j < parts.length; j++) {
                var val = parts[j].trim();
                if(options.lowercaseEverything) val = val.toLowerCase();
                keys.push(val);
            }
        }
        else {
            var obj = {};
            for(var j = 0; j < keys.length; j++) {
                if(j >= parts.length) break;
                var val = parts[j].trim();
                if(options.lowercaseEverything) val = val.toLowerCase();
                obj[keys[j]] = val;
            }
            json.push(obj);
        }
    }
    return json;
}

function FileUploader(input, uploadArea, options) {
    options = options || {};
    var self;
    var dragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
        uploadArea.classList.add("hover");
    };
    var dragLeave = (e) => {
        e.stopPropagation();
        e.preventDefault();
        uploadArea.classList.remove("hover");
    };
    var drop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const dt = e.dataTransfer;
        const files = dt.files;
        self.handleFiles(files);
        uploadArea.classList.remove("hover");
    };
    self = {
        list: null,
        files: [],
        init: () => {
            self.list = SelectableList(uploadArea, options.listOptions);
            self.list.addEvent("onFillNode", "fileUploader", (itemNode, item, idx) => {
                appendText(itemNode, item.name);
            });
            self.setupBindings();
        },
        setupBindings: () => {
            var nodes = [
                uploadArea,
                input
            ];
            if(input.nextSibling) {
                var next = input.nextElementSibling;
                if(next.tagName === "LABEL" && next.getAttribute("for") === input.id) {
                    nodes.push(next);
                }
            }
            for(var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                console.log(node);
                node.addEventListener("dragenter", dragOver, false);
                node.addEventListener("dragover", dragOver, false);
                node.addEventListener("dragleave", dragLeave, false);
                node.addEventListener("drop", drop, false);
            }
            input.addEventListener("change", () => {
                self.handleFiles(input.files);
            }, false);
        },
        handleFiles: (files) => {
            var list = [];
            for(var i = 0; i < files.length; i++) {
                if(!files[i].type.startsWith("text/")) continue;
                list.push(files[i]);
            }
            self.setList(list);
        },
        setList: (files) => {
            var list = new Array(files.length);
            input.classList.toggle("dropped", files.length > 0);
            uploadArea.classList.toggle("dropped", files.length > 0);
            var completed = 0;
            var updateListDebounce = null;
            for(var i = 0; i < files.length; i++) {
                list[i] = "";
                var file = files[i];
                const reader = new FileReader();
                reader.onloadend = (e) => {
                    completed++;
                    if(completed >= files.length) {
                        if(options.onUploadFinish) {
                            options.onUploadFinish(list);
                        }
                    }
                };
                ((name, idx) => {
                    reader.onload = (e) => {
                        list[idx] = {
                            name: name,
                            data: e.target.result
                        };
                        if(!updateListDebounce) {
                            updateListDebounce = setTimeout(() => {
                                self.list.setList(list);
                                self.files = list;
                                updateListDebounce = null;
                            }, 50);
                        }
                    };
                })(file.name, i);
                reader.readAsBinaryString(files[i]);
            }
        }
    };
    self.init();
    return self;
}


function WebSocketFactory(url, options) {
    options = options || {};
    var timeout = null;
    var start = 0;
    var self;
    self = {
        context: 0,
        contextList: {},
        buffer: [],
        connected: false,
        connecting: false,
        setupSocket: () => {
            console.log("Created new socket");
            var socket = new WebSocket(url);
            var interval = () => {
                if(socket.readyState !== 0 && socket.readyState !== 1) { 
                    self.connecting = false;
                    console.log("Websocket connection failed");
                }
                else if(socket.readyState === 1) {
                    self.connecting = false;
                    console.log("Websocket connected");
                    self.connected = true;
                    if(self.connected) {
                        for (var i = 0; i < self.buffer.length; i++) {
                            self.sendId(self.buffer[i]);
                        }
                        self.buffer = [];
                    }
                }
                else if(new Date().getTime() - start < 5000) {
                    clearTimeout(timeout);
                    timeout = setTimeout(interval, 1);
                }
                else {
                    self.connecting = false;
                    console.log("Websocket connection timed out");
                }
            };
            socket.onopen = function() {
                console.log("Websocket open");
                clearTimeout(timeout);
                start = new Date().getTime();
                timeout = setTimeout(interval, 1);
            };
            socket.onmessage = function(message) {
                var packet = JSON.parse(message.data);
                var id = "" + packet.id;
                var data = packet.data;
                var context = self.contextList[id]
                if (context) {
                    if(context.callback) context.callback(data || {err:1});
                    delete self.contextList[id];
                }
            };
            socket.onclose = socket.onclose = function() {
                console.log("Websocket closed");
                self.connected = false;
                self.connecting = false;
            };
            self.socket = socket;
        },
        sendId: (id) => {
            var context = self.contextList[id];
            if(context) {
                var wrapped = {
                    data: {
                        method: context.method,
                        args: context.args
                    },
                    id: id
                };
                self.socket.send(JSON.stringify(wrapped));
            }
        },
        send: (method, args, callback) => {
            var id = ++self.context;
            self.contextList["" + id] = {
                method: method,
                args: args,
                callback: callback
            };
            if(self.connected) {
                self.sendId(id);
            }
            else {
                self.buffer.push(id);
                if(!self.connecting) {
                    self.connecting = true;
                    self.setupSocket();
                }
            }
        }
    };
    self.setupSocket();
    return self;
}

var domEventListener = DomEventListener();