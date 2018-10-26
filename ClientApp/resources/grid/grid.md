# Grid
A grid binds to `data:Rows` which is a collection of models for rows.

There are two models. The bindable property `data` is the mechanism for supplying data to the grid and expects an array of objects. The internal `rows` property is the subset of `data` that satisfies the `where` predicate. Elaborate binding support means you can add or remove elements of `data`, or even replace the entire array object, and `rows` will stay in sync.

There is no need for explicit column metadata because it can all be expressed directly and in context as mark-up. Expressions are supported by the binding system, and the full power of HTML5/CSS is available to lay out and format a row. 

The `if.bind` clause prevents binding from occurring until data is available. You should always include this.
```
<grid if.bind="arrayOfRowData" data.bind="arrayOfRowData">
  <template replace part="head">
    <th class="formatting for column-1">
      Literal header for column-1
    </th>
    <th class="formatting for column-2 header">
      Literal header for column-2
    </th>
  </template>
  <template replace part="row">
    <td class="formatting for column-1">
      ${row.model.column1}
    </td>
    <td class="formatting for column-2">
      ${row.model.column2}
    </td>
  </template>
</grid>
```
# Bindable attributes
## Configuration
### autofocus
Causes the grid to focus itself when it is attached to the DOM.
This does not prevent focus from being moved elsewhere.
### grid-action
The grid attribute `grid-action` defines an application supplied function. When action is invoked on the grid, this handler will be called and passed a row object for each item in the grid's `tagged` row collection, or called once and passed the `selected` row, depending on whether tagging support is enabled. 

Firing the action event is left to application code because this way it is possible to bind event handlers into application supplied markup.
### global-key-handling
When this property is set to true, the grid's key handler is attached to the window instead of the element, causing it to respond to keystrokes irrespective of focus.
### data
This is the base data you supplied for tabulation.
### key
This is a function producing a candidate key from `GridRow.model`
### where
`Where` is an application supplied function for restricting the data you supplied while constructing row objects to populate the `rows` collection. Because it operates directly on the data you supply, there is no need to dereference.
### support-tagging
A boolean switch for multiple selection support.
## Run-time state
### value
The model for the selected row. Assigning a value will change the selected row if a row can be found with a model from which key produces a value matching the value key produces from the assigned value.
### tagged
An array of models of selected rows. These are the rows with ticks on them. 
