# Famous Core Libraries

## Overview

The Famous core libraries are composed of:

* FamousEngine (Engine.js) - The singleton object initiated upon process 
      startup which manages all active {@link FamousContext} instances, runs 
      the render dispatch loop, and acts as a global listener and dispatcher 
      for all events.
* Rendering System
  * FamousSurface (Surface.js) -  A base class for viewable content and event 
      targets inside a Famous applcation, containing a renderable document 
      fragment.
  * FamousRenderNode (RenderNode.js) - A linked list object wrapping a
      {@link renderableComponent} (like a {@link FamousTransform} or 
      {@link FamousSurface}) for insertion into the render tree.
  * FamousSurfaceManager (SurfaceManager.js) - An internal-only component
      responsible for managing the properties of a set of surfaces in 
      a specified {@link FamousContainerSurface} or {@link FamousContext}.
  * FamousContainerSurface (ContainerSurface.js)- An object designed to contain
      surfaces, and set properties to be applied to all of them at once.
  * FamousContext (Context.js) - The top-level container for a Famous-
      renderable piece of the document.
* Event System
  * FamousEventHandler (EventHandler.js) - This object gives the user the opportunity to explicitly 
      control event propagation in their application.
  * FamousEventArbiter (EventArbiter.js) - A switch which wraps several event 
      destinations and redirects received events to at most one of them. 
* FamousMatrix (Matrix.js) - A high-performance matrix math library used to calculate affine 
    transforms on surfaces and other renderables.
* SpecParser (SpecParser.js) - This object translates the the rendering 
    instructions of type  {@link renderSpec} that {@link renderableComponent} 
    objects generate  into direct document update instructions of type 
    {@link updateSpec} for the {@link SurfaceManager}.
* FamousTransform (Transform.js) - A collection of visual changes to be
     applied to another renderable component. 
* FamousTransitionHelper (TransitionHelper.js) - A state maintainer for a 
     smooth transition between numerically-specified states. 
* Utility.js - This namespace holds standalone functionality. 

## Proposed levels of visibility

Famo.us might be open source or not, but in any case, each developer will 
benefit from having just enough knowledge to do their job well.  The details
of Matrix interpolation maybe be confusing and uninteresting to application 
developers, just as device developers will need to know how the SurfaceManager
deploys to the document.

Exposing an interface at these natural levels makes sense, so marked throughout
the document are references to one of these (Scope)s.  If none is marked for
the class/namespace, it's on a per-symbol basis.  If none is marked for the 
symbol, we assume it's "application developer and deeper", or really, 
"all developers".  From shallowest to deepest:

* Application Developers: Anyone looking to put together existing "Components,
  Widgets and Templates" in order to create an application.  They would need 
  (calling) access to the following kinds of concepts in the Engine:
  * Elements to do directly with visual behavior:
    * Surface: the basic unit of visual display.  Many developers may not
      even get this far down.
    * ContainerSurface: Though SurfaceManager-related internals should be 
      hidden, this is exposed to application developers through components.
    * Transform: Apply positional and opacity changes to an element
  * Elements to do directly with event behavior:
    * EventHandler: Provides famililar .on() style callbacks for doc events.
    * The emit() events on event-handling objects, and where events will
      "bubble" to.  These could be component-level concepts instead, also.
  * Elements which are exposed in order to put the document together:
    * RenderNode: Used to put elements together
    * Context: Though this concept should probably be eliminated in favor of
      implicit or explicit ContainerSurfaces, IMO.

* Component Developers: Developers with knowledge of the render system looking
    to build more complex visuals and interactions (TODO: Widgets?
    How to name this?), and likely will be taking advantage of the physics
    engine directly.  They may be looking to build an entire visual theme
    as well.  They need to know (in addition to the above levels):
  * Details of the render loop:
    * render() loop and render spec type: how to specify exact rendering of 
      their component, which likely makes recursive calls to render() other 
      components.
    * RenderNode: A concept we should likely hide from the application 
      developer, or eliminate entirely. 
  * Mathematical concepts:
    * Matrix: Actual webkit-transform wrapper, and useless to non-math people.
      We should probably wrap things like "rotate" in the Transform itself.
    * TransitionHelper: Mathematical curve interpolation.  
  * EventArbiter: This would probably be hidden from application developers
    by a template like a "Page Application".

* Device Developers: Also possibly "internal only", these are developers who 
    need deep knoweldge of or have control of the DOCUMENT itself.  Think 
    those who have access to the source of the browser that actually renders
    the content.
  * Deploying directly to the document:
    * update() loop and update spec type, and SurfaceManager: Actually renders
      content to the document using that document's primitives, and contains
      knowledge about how to tune for performance.
    * .deploy and .recall methods
  * True internals to the engine, which could be hidden for all, actually:
    * SpecParser


## Tests

Tests for the Famous Core are not in this repo, but can instead by run by 
cloning our [famous/famous-test](https://github.com/Famous/famous-test) repo. 
Instructions for usage can be found in the `README.md` for that repo.

## Type Checking with Google Closure Compiler

First download and extract Google Closure Compiler: 
[download link](http://closure-compiler.googlecode.com/files/compiler-latest.zip)

To typecheck with Google's Closure Compiler, do the following:

    $ CLOSURE_COMPILER=/path/to/google/closure/compiler.jar
    $ java -jar $CLOSURE_COMPILER --js !(*externs).js \
      --js_output_file /tmp/`basename $PWD`_compiled.js \
      --externs externs.js --jscomp_error checkTypes 

## Documentation

NOTE: Documentation as of this commit is inteded for JSDoc 3, referenced below.  Other toolkits talking JSDoc style as an input will most definitely produce highly different results.  


The Famous API documentation is commented inline in JSDoc format. Documentation 
in other formats such as HTML can be generated using any tool that understands 
JSDoc. 

The JSDoc tags we use include all those in JSDoc plus the [Google Closure 
Compiler type annotations](https://developers.google.com/closure/compiler/docs/js-for-compiler) 
used for static analysis.

Below are several ways to generate HTML or Markdown flavored documentation from 
our inline JSDoc comments. I tried a bunch out and the following were the only 
ones that didn't break on unsupported tags.

YUIDoc, is a flavor of JSDoc (as is Google Closure Compiler's version of JSDoc 
used for compiler type annotations). The YUIDocs system is pretty solid and 
and might be a good starting point for documentation. The API docs for the 
ember.js project are a great example of YUIDocs. However, with that all in mind 
and with the idea that we may need to host decent docs for all the modules in 
the famous ecosystem, we may want to explore our own hosted docs system, free 
for open-source famous modules, and paid for private modules.

### via JSDoc npm module

Install the JSDoc npm module globally:

    $ npm install -g git://github.com/jsdoc3/jsdoc.git

Run:

    $ jsdoc *
    
### via JSDoc Toolkit

Download and install [JSDoc Toolkit](http://code.google.com/p/jsdoc-toolkit/).

Run JSDoc Toolkit by executing the following command from the jsdoc-toolkit 
directory: 

    $ OUT=destination/folder/for/the/jsdoc/index.html/file
    $ SRC=folder/where/the/
    $ java -jar jsrun.jar app/run.js -a --suppress -p -d=$OUT -t=templates/jsdoc $SRC

From the code.google.com site, "NOTICE: As of 27 June 2010 the JsDoc Toolkit 
Version 2 project is no longer under active development or support.". With this 
in mind, we should probably start working with [JSDoc3](https://github.com/jsdoc3/jsdoc) 
and deprecate this section in favor of instructions for JSDoc3.

### via dox-foundation

[dox-foundation](https://github.com/punkave/dox-foundation) generates decent 
looking documentation with syntax highlighting. 

Install:

    $ npm install -g dox-foundation

Run:

    $ dox-foundation --title "Famous Core" --source . --target ./doc

### via Markdox

[Markdox](https://github.com/cbou/markdox) is a JSDoc documentation generator 
that outputs Markdown.

Install:

    $ npm install -g markdox

Run:

    $ markdox *

### via Docker

While not as feature rich as JSDox Toolkit, the `npm` installable 
[docker](http://jbt.github.io/docker/README.md.html) is a quick and dirty way of 
generating good looking documentation with a 
[docco](http://jashkenas.github.io/docco/) style layout.

Install:

    $ npm install -g docker

Run:

    $ docker *
    
