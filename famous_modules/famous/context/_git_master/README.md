# context

Context is the container that other famous components live inside of.  They are the highest level item that is part of the render tree.  Every context has a render node that acts of the root for that render-tree.  On a per-frame basis, the engine tells all of the context's to render themselves.

## API

**Creation:**  Engine.createContext()

## Bugs

If you encounter an issue, please report it to one/both of the following:

* Github Issues: <https://github.com/Famous/famous/issues>
* Email: famo.us@googlegroups.com

## See Also

* [render-node](https://github.com/Famous/famous/render-node)
* [event-handler](https://github.com/Famous/famous/event-handler)
* [spec-parser](https://github.com/Famous/famous/spec-parser)
* [element-allocator](https://github.com/Famous/famous/element-allocator)
* [matrix](https://github.com/Famous/famous/matrix)
* [transitionable](https://github.com/Famous/famous/transitionable)

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
