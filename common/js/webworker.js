class WebWorkerServer {
    constructor(transport, workerGlobalScope) {
        this.transport = transport;
        this.postMessage_ = workerGlobalScope.postMessage;
        this.workerGlobalScope = workerGlobalScope;
        workerGlobalScope.onmessage = this.onMessage.bind(this);
    }

    onMessage(e) {
        let id = e.data[0];
        let method = e.data[1].method;
        let args = e.data[1].args;
        let source = e.data[1].source;
        let p = this.transport.send(method, args)
        if(p && (p instanceof Promise)) {
            p.then(results => {
                this.postMessage(id, null, results);
            })
            .catch(err => {
                this.postMessage(id, err);
            });
        }
        else {
            console.error(`WebWorkerServer transport passed back invalid promise for ${method} ${id}`);
            this.postMessage(id, "Invalid worker transport");
        }
        return p;
    }

    postMessage(...args) {
        this.postMessage_.apply(this.workerGlobalScope, [args]);
    }
}

    // Wraps requests in promises and maintains id state for the results
class WebWorkerClient {
    constructor(url) {
        this.worker = new Worker(url);
        this.worker.onmessage = this.onMessage.bind(this);
        this.messageId = 0;
        this.messages = {};
    }

    send(method, args) {
        return new Promise((resolve, reject) => {
            let id = this.messageId++;
            this.worker.postMessage([id, {
                source: "client",
                method: method,
                args: args
            }]);
            this.messages[id] = {
                resolve: resolve,
                reject: reject
            };
        });
    }

    onMessage(id, err, results) {
        if(this.messages[id]) {
            let message = this.messages[id];
            if(err) message.reject(err);
            else message.resolve(results);
            delete this.messages[id];
        }
    }
}