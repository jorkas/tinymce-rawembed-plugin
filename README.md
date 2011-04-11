Flash embed plugin for TinyMCE
=========================

A TinyMCE plugin that have support only flash embed, based at the original TinyMCE media plugin.

Features
--------

* Menu button that have the media icon
* Dialog with textarea to paste flash embed code
* Automatically formatting of flash embed when code pasted in HTML view

Dependencies
------------

* The plugin is built on TinyMCE 3.4 (releaseDate: 2011-03-10)
* The editor have to support i.e valid_elements : 'object[classid|width|height|codebase|*],param[name|value|_value],embed[type|width|height|wmode|src|*],img[id|class|src|data-mce-src|data-mce-json|width|height]'

Usage / Examples
-----

* Define rawembed plugin in the plugins section
* Define rawembed button in the button section
  
            tinyMCE.init({
                // General options
                mode : 'specific_textareas',
                editor_selector : 'editor',
                theme : "advanced",
                plugins : "inlinepopups,paste,rawembed",

                // Theme options
                theme_advanced_buttons1 : "bold,italic,underline,strikethrough,bullist,|,rawembed,code",
                theme_advanced_buttons2 : "",
                theme_advanced_buttons3 : "",
                theme_advanced_buttons4 : "",
                theme_advanced_toolbar_location : "top",
                theme_advanced_toolbar_align : "left",
                theme_advanced_statusbar_location : "bottom",
                theme_advanced_resizing : true,
            });  

Example can be found here: (http://joakim-westerlund.se/lab/tinymce/tinymce-embed-editor.html)

Links
-----

* Author:  [Joakim Westerlund](http://github.com/jorkas) - [Homepage](http://joakim-westerlund.se)
* Company: [Mynewsdesk](http://www.mynewsdesk.com)
* Blog: [Blog](http://devcorner.mynewsdesk.com)

Please use the [GitHub issue tracker](https://github.com/jorkas/tinymce-rawembed-plugin/issues) for bug
reports and feature requests.
