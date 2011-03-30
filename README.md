Flash embed plugin for TinyMCE
=========================

A TinyMCE plugin that have support only flash embed, based at the original TinyMCE media plugin.

Features
--------

* Menubutton that have the media icon
* Dialog with textarea to paste flash embed code
* Autoformatting of embed code past in HTML view

Dependencies
------------

The plugin is built on TinyMCE 3.4 (releaseDate: 2011-03-10)

Usage / Examples
-----

* Define rawembed plugin in the plugins section
* Define rawembed button in the button section
  
        tinyMCE.init({
            editor_selector : 'tiny_editor',
            entity_encoding : 'raw',
            plugins : "inlinepopups,paste,rawembed",
            theme : 'advanced',
            theme_advanced_buttons1 : "bold,italic,underline,strikethrough,bullist,undo,redo,|,link,unlink,|,rawembed,|,cleanup,code",
            theme_advanced_resizing : true,
            theme_advanced_toolbar_align : 'left',
            theme_advanced_toolbar_location : 'top'
        });  

Links
-----

* Author:  [Joakim Westerlund](http://github.com/jorkas) - [Homepage](http://joakim-westerlund.se)
* Company: [Mynewsdesk](http://www.mynewsdesk.com)

Please use the [GitHub issue tracker](https://github.com/jorkas/tinymce-rawembed-plugin/issues) for bug
reports and feature requests.
