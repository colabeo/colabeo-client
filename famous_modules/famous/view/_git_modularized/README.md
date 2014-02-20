# view

View is a application level container for a render node.  While render node is designed to be part of the render tree, view is more of an application level interface.  It is composed of three high level parts, the node, event handlers, and options manager.

The node property of the views is for including renderables and modifiers in the actual render tree.

The event handler's are for piping events to and from any of the components the view manages.

The options manager is for properly retrieving and patching in options.

## API

#### getOptions

Returns an object containing all of the options for the view.

#### setOptions

Params:
* object to add to the existing options

Given an options object, patch the new options into the existing set of options.

#### _link

Calls the link function of the view's node.  See [render-node documentation](https://github.com/Famous/famous/tree/modularized/render-node) for more details.

#### _add

Calls the add function of the view's node.  See [render-node documentation](https://github.com/Famous/famous/tree/modularized/render-node) for more details.

#### render

Returns the render specification for the node of the view. This spec is what is used in the commit phase. See [render-node documentation](https://github.com/Famous/famous/tree/modularized/render-node) for more details.

#### getSize

If renderables have been added to the node, return the getSize of the renderables.  If none have been added, return the size property of the options object.

## Bugs

If you encounter an issue, please report it to one/both of the following:

* Github Issues: https://github.com/Famous/famous/issues
* Email: famo.us@googlegroups.com

## See Also

* [render-node](https://github.com/Famous/famous/tree/modularized/render-node)
* [event-handler](https://github.com/Famous/famous/tree/modularized/event-handler)
* [options-manager](https://github.com/Famous/famous/tree/modularized/options-manager)

## License

	The MIT License
	===============

	Copyright (c) 2009 Anton Grigoryev

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
