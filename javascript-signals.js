;(function(alias) {

    // local reference
    var SK = (alias) ? window[alias] = {} : window.SK = {};


    /**
     * Crockford's beget function
     */
    var beget = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    }


    /**
     * Abstract Signal dispatcher
     */
    SK.AbstractSignal = function() {}

    SK.AbstractSignal.prototype = {
        _slotCollection: null,

        register: function(handler, context) {
            var slot = new SK.Slot(handler, context);
            return this._slotCollection.append(slot, { context: context });
        },

        registerByPriority: function(handler, context, priority) {
            var slot = new SK.Slot(handler, context, priority);
            return this._addByPriority(slot);
        },

        remove: function(listener) {
            this._slotCollection.remove(listener);
            return this;
        },

        removeAll: function() {
            this._slotCollection.removeAll();
            return this;
        },

        dispatch: function(message) {
            var list = this._slotCollection.getSlotList();
            for(var i = 0; i < list.length; i++)
                list[i].execute(message);
            return this;
        },

        _addByPriority: function(slot) {
            var stack = this._slotCollection.getSlotList(), i = stack.length, needle = slot.getPriority();
            do { i--; } while(stack[i] && slot.getPriority() <= stack[i].getPriority());
            return stack.splice(i+1, 0, slot);
        }
    }


    /**
     * OnceSignal one-time dispatcher
     */
    SK.OnceSignal = function() {
        this._slotCollection = null;
        this.initialize();
    }

    SK.OnceSignal.prototype = beget(SK.AbstractSignal.prototype);

    SK.OnceSignal.prototype._slotAdded = false;

    SK.OnceSignal.prototype.initialize = function() {
        this._slotCollection = new SK.SlotCollection();
    }

    SK.OnceSignal.prototype.add = function(handler, options) {
        var opt = options || {};
        if(this._slotAdded == true)
            throw new Error('Cannot add more then one slot for a OnceSignal type');
        this._slotAdded = true;
        return this.register(handler, opt.context);
    }


    /**
     * Simple Signal object
     */
    SK.Signal = function() {
        this._slotCollection = null;
        this.initialize();
    }

    SK.Signal.prototype = beget(SK.AbstractSignal.prototype);

    SK.Signal.prototype.initialize = function() {
        this._slotCollection = new SK.SlotCollection();
    }

    SK.Signal.prototype.add = function(handler, options) {
        var opt = options || {};
        return this.register(handler, opt.context);
    }


    /**
     * PrioritySignal
     * 
     * @description A signal defined by a stack/queue
     */
    SK.PrioritySignal = function() {
        this._slotCollection = null;
        this.initialize();
    }

    SK.PrioritySignal.prototype = beget(SK.AbstractSignal.prototype);

    SK.PrioritySignal.prototype.initialize = function() {
        this._slotCollection = new SK.SlotCollection();
    }

    SK.PrioritySignal.prototype.add = function(handler, options) {
        var opt = options || {};
        return this.registerByPriority(handler, opt.context, opt.priority);
    }


    /**
     * Collections of slots which will reference the signal's slot/s
     * Also holds a list of callbacks(slots) currently used by a signal
     */
    SK.SlotCollection = function() {
        this._list = [];
    }

    SK.SlotCollection.prototype = {
        _list: null,

        append: function(slot) {
            if(typeof slot.getHandler() !== 'function')
                throw new Error('Listener slot must be a function!');
            this._list.push(slot);
            return slot;
        },

        remove: function(slot) {
            var index = this._getIndex(listener);
            this._removeSlot(index);
        },

        removeAll: function() {
            this._list = [];
        },

        getSlotList: function() {
            return this._list;
        },

        _getIndex: function(listener) {
            var slot, item;
            for(item in this._list) {
                slot = this._list[item];
                if(slot.getHandler() === listener)
                    return item;
            }
            return -1;
        },

        _removeSlot: function(slotIndex) {
            if(slotIndex >= 0)
                this._list.splice(slotIndex, 1);
        }
    }


    /**
     * Actual handler function of the Slot/Signal system
     */

    SK.Slot = function(handler, context, priority) {
        this.initialize(handler, context, priority);
    }

    SK.Slot.prototype = {
        _handler: null,

        _context: null,

        _priority: 0, 

        initialize: function(handler, context, priority) {
            this.setHandler(handler);
            this.setContext(context || this);
            this.setPriority(priority || 0);
        },

        execute: function(message) {
            this._handler.call(this._context, message);
        },

        /* Context */

        setContext: function(ctx) {
            if(typeof ctx !== 'object')
                throw new Error('Slot context(ctx) should be of type object');
            this._context = ctx;
        },

        getContext: function() {
            return this._context;
        },

        /* Priority */

        setPriority: function(priority) {
            if(typeof priority !== 'number')
                throw new Error('slot priority should be of type number');
            this._priority = priority;
        },

        getPriority: function() {
            return this._priority;
        },

        /* Handlers */

        setHandler: function(handler) {
            if(typeof handler !== 'function')
                throw new Error('slot handler must be of type function!');
            this._handler = handler;
        },

        getHandler: function() {
            return this._handler;
        }
    }
}('SK'));