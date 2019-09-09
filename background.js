

// https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
class Node {
    constructor(pageData) {
        this.data = new PageData(pageData);
        this.name = pageData.url;
        this.parent = null;
        this.children = [];
    }
}

class PageData {
    constructor(data) {
        this.title = data.title;
        this.url = data.url;
        this.transitionType = data.transitionType;
        this.complete = data.complete;
        this.time = data.time;
    }
}

//https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
class Tree {
    constructor(data) {
        var node = new Node(data);
        this._root = node;
    }
    traverseDF(callback) {
        (function recurse(currentNode) {
            for (var i = 0, length = currentNode.children.length; i < length; i++) {
                recurse(currentNode.children[i]);
            }
            callback(currentNode);
        })(this._root);
    }
    traverseBF(callback) {
        var queue = new Queue();
        queue.enqueue(this._root);
        currentTree = queue.dequeue();
        while (currentTree) {
            for (var i = 0, length = currentTree.children.length; i < length; i++) {
                queue.enqueue(currentTree.children[i]);
            }
            callback(currentTree);
            currentTree = queue.dequeue();
        }
    }
    contains(callback, traversal) {
        traversal.call(this, callback);
    }
    add(data, toName, traversal) {
        var child = new Node(data), parent = null, callback = function (node) {
            if (node.data.url === toName) {
                parent = node;
            }
        };
        this.contains(callback, traversal);
        if (parent) {
            if (parent.parent == undefined || parent.parent.name != child.data.url) {
                parent.children.push(child);
                child.parent = parent;
            }
        }
        else {
            throw new Error('Cannot add node to a non-existent parent');
        }
    }
    remove(data, fromData, traversal) {
        var tree = this, parent = null, childToRemove = null, index;
        var callback = function (node) {
            if (node.data === fromData) {
                parent = node;
            }
        };
        this.contains(callback, traversal);
        if (parent) {
            index = findIndex(parent.children, data);
            if (index === undefined) {
                throw new Error('Node to remove does not exist.');
            }
            else {
                childToRemove = parent.children.splice(index, 1);
            }
        }
        else {
            throw new Error('Parent does not exist');
        }
        return childToRemove;
    }
}
function findIndex(arr, data) {
    var index;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].data === data) {
            index = i;
        }
    }
    return index;
}

chrome.tabs.onCreated.addListener(function(tab) {
    var now = new Date();
    var result = {
        'transition': null,
        'lastVisitTime': now.getTime()
    };
    addNewNode(tab, result, previousUrl);
});


chrome.browserAction.onClicked.addListener(function() {
    initializeTree();
});

chrome.webNavigation.onBeforeNavigate.addListener(function(object) {
    chrome.tabs.get(object.tabId, function(tab) {
        previousUrl = tab.url;
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        var details = { 'url': tab.url.toString()};

        parent = previousUrl;

        chrome.history.getVisits(details, function(results) {
            if (results[0].transition == 'link' || results[0].transition == 'keyword_generated' || results[0].transition == 'typed') {
                addNewNode(tab, results[0], parent);
            }
        });
    }
});


function initializeTree() {
    chrome.tabs.query({'active': true}, function(tab) {
        if (tab[0].status === 'complete') {
            var now = new Date();
            var data = {
                'title': tab[0].title,
                'url': tab[0].url,
                'transitionType': null,
                'complete': 'false',
                'time': now.getTime()
            };
            tree = new Tree(data);
            console.log('Root: ' + tree._root);
        }
    });
}

function addNewNode(page, visit, parent) {
    if (tree == undefined) {
        initializeTree();
    }
    else {
        var data = {
            'title': page.title,
            'url': page.url,
            'transitionType': visit.transition,
            'complete': 'false',
            'time': visit.lastVisitTime
        };
        tree.add(data, parent, tree.traverseDF);
    
        console.log(tree);
    }
}

