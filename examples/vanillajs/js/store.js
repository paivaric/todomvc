/*jshint eqeqeq:false */
(function (window, Parse) {
  'use strict';

  function initParseServer () {
    // check it in https://dashboard.back4app.com/classic#/wizard/app-details/702a4879-3055-43c2-9b72-58b7be548810
    const PARSE_APP_ID = 'FBtpcoBSGvnVFU6Dg0PVUEYfCTRbDVHFqQ9wJ9UB'
    const PARSE_JS_KEY = 'cjbOdCf8YH69rSfS55MKlvYV0Ho87oiwCfbpSygy'
    Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
    Parse.serverURL = "https://parseapi.back4app.com/";
  }

  initParseServer();

  var Todo = Parse.Object.extend("Todo");
  var allTodos = [];

  /**
   * Creates a new client side storage object and will create an empty
   * collection if no collection already exists.
   *
   * @param {string} name The name of our DB we want to use
   * @param {function} callback Our fake DB uses callbacks because in
   * real life you probably would be making AJAX calls
   */
  function Store (name, callback) {
  }

  /**
   * Finds items based on a query given as a JS object
   *
   * @param {object} query The query to match against (i.e. {foo: 'bar'})
   * @param {function} callback   The callback to fire when the query has
   * completed running
   *
   * @example
   * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
   */
  Store.prototype.find = function (subquery, callback) {
    if (!callback) {
      return;
    }

    var query = new Parse.Query(Todo);
    if (subquery && subquery.id) query.equalTo('objectId', subquery.id);
    if (subquery && subquery.title) query.matches('title', subquery.title);

    query.ascending('createdAt').limit(100).find().then(function (todos) {
      allTodos = todos;
      setViewTodos(callback, todos);
    }).catch(function (error) {
      alert('Failed to retrieving objects, with error code: ' + error.message);
    });
  };

  /**
   * Will retrieve all data from the collection
   *
   * @param {function} callback The callback to fire upon retrieving data
   */
  Store.prototype.findAll = function (callback) {
    if (!callback) {
      return;
    }

    var query = new Parse.Query(Todo);

    query.ascending('createdAt').limit(100).find().then(function (todos) {
      allTodos = todos;
      setViewTodos(callback);
    }).catch(function (error) {
      alert('Failed to retrieving objects, with error code: ' + error.message);
    });
  };

  /**
   * Will save the given data to the DB. If no item exists it will create a new
   * item, otherwise it'll simply update an existing item's properties
   *
   * @param {object} updateData The data to save back into the DB
   * @param {function} callback The callback to fire after saving
   * @param {number} id An optional param to enter an ID of an item to update
   */
  Store.prototype.save = function (updateData, callback, id) {
    var todo = allTodos.find(function (todo) {
      return todo.id === id;
    });

    if(!todo) todo = new Todo();

    for (var key in updateData) {
      todo.set(key, updateData[ key ]);
    }

    todo.save().then(callback).catch(function (error) {
      console.log(error)
    });
  };

  /**
   * Will remove an item from the Store based on its ID
   *
   * @param {number} id The ID of the item you want to remove
   * @param {function} callback The callback to fire after saving
   */
  Store.prototype.remove = function (id, callback) {
    var todo = allTodos.find(function (todo) {
      return todo.id === id;
    });
    todo.destroy().then(function () {
      allTodos = allTodos.filter(function (todo) {
        return todo.id !== id;
      })
      setViewTodos(callback);
    })
  };

  /**
   * Will drop all storage and start fresh
   *
   * @param {function} callback The callback to fire after dropping the data
   */
  Store.prototype.drop = function (callback) {
    Todo.destroyAll(allTodos).then(function () {
      Store.prototype.findAll(callback)
    })
  };

  function setViewTodos (callback, todos) {
    var viewTodos = (todos || allTodos).map(function (todo) {
      return {
        id: todo.id,
        title: todo.get('title'),
        completed: todo.get('completed')
      }
    });
    callback.call(this, viewTodos);
  }

  // Export to window
  window.app = window.app || {};
  window.app.Store = Store;
})(window, Parse);
