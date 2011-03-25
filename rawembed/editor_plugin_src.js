/**
 * Copied from tinymce media plugin and modifed to suite its needs for just embed flash.
 *
 * http://devcorner.mynewsdesk.com
 * @author Joakim Westerlund
 */
(function() {
    var rootAttributes = tinymce.explode('id,name,width,height,style,align,class,hspace,vspace,bgcolor,type'), excludedAttrs = tinymce.makeMap(rootAttributes.join(',')), Node = tinymce.html.Node,
        mediaTypes, scriptRegExp, JSON = tinymce.util.JSON, mimeTypes;	
    // Load plugin specific language pack
    tinymce.PluginManager.requireLangPack('rawembed');
    tinymce.create('tinymce.plugins.RawembedPlugin', {
        /**
        * Initializes the plugin, this will be executed after the plugin has been created.
        * This call is done before the editor instance has finished it's initialization so use the onInit event
        * of the editor instance to intercept that event.
        *
        * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
        * @param {string} url Absolute URL to where the plugin is located.
        */
        init : function(ed, url) {
            var self = this, lookup = {}, i, y, item, name;
            item = {
                name : "Flash",
                clsids : "d27cdb6e-ae6d-11cf-96b8-444553540000",
                mimes : "application/x-shockwave-flash",
                codebase : "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
            };
            lookup['clsid:' + item.classid] = item;
            lookup[item.mimes] = item;
            lookup['mceItem' + item.name] = item;
            lookup[item.name.toLowerCase()] = item;

            self.editor = ed;
            self.url = url;
            self.lookup = lookup;
            
            //add plugin specific styles
            ed.contentCSS.push(url+'/css/content_rawembed.css');

            function isRawEmbedImg(node) {
                return node && node.nodeName === 'IMG' && ed.dom.hasClass(node, 'mceItemRawEmbed');
            };

            // TinyMCE events begins here
            ed.onPreInit.add(function() {
                // Allow video elements
                ed.schema.addValidElements('object[id|style|width|height|classid|codebase|*],param[name|value],embed[id|style|width|height|type|src|*]');

                // Convert video elements to image placeholder
                ed.parser.addNodeFilter('object,embed', function(nodes) {
                    var i = nodes.length;
                    while (i--){
                        self.objectToImg(nodes[i]);
                    }
                });
                // Convert image placeholders to video elements
                ed.serializer.addNodeFilter('img', function(nodes, name, args) {
                    var i = nodes.length, node;
                    while (i--) {
                        node = nodes[i];
                        if ((node.attr('class') || '').indexOf('mceItemRawEmbed') !== -1){
                            self.imgToObject(node, args);
                        }
                    }
                });
            });

            //Init state of context meny and fix ath
            ed.onInit.add(function() {
                // Display "media" instead of "img" in element path
                if (ed.theme && ed.theme.onResolveName) {
                    ed.theme.onResolveName.add(function(theme, path_object) {
                        if (path_object.name === 'img' && ed.dom.hasClass(path_object.node, 'mceItemRawEmbed'))
                        path_object.name = 'embeded';
                    });
                }

                // Add contect menu if it's loaded
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(plugin, menu, element) {
                        if (element.nodeName === 'IMG' && element.className.indexOf('mceItemRawEmbed') !== -1)
                        menu.add({title : 'rawembed.edit', icon : 'rawembed', cmd : 'mceRawembed'});
                    });
                }
            });

            // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            ed.addCommand('mceRawembed', function() {
                var data, img;

                img = ed.selection.getNode();
                if (isRawEmbedImg(img)) {
                    data = JSON.parse(ed.dom.getAttrib(img, 'data-mce-json'));

                    // Add some extra properties to the data object
                    tinymce.each(rootAttributes, function(name) {
                        var value = ed.dom.getAttrib(img, name);

                        if (value)
                        data[name] = value;
                    });

                    data.type = self.getType(img.className).name.toLowerCase();
                }

                if (!data) {
                    data = {
                        type : 'flash',
                        video: {sources:[]},
                        params: {}
                    };
                }

                ed.windowManager.open({
                    file : url + '/rawembed.htm',
                    width : 478 + ed.getLang('rawembed.delta_width', 0),
                    height : 300 + ed.getLang('rawembed.delta_height', 0),
                    inline : 1
                }, {
                    plugin_url : url
                });
            });

            // Register example button
            ed.addButton('rawembed', {
                title : 'rawembed.desc',
                cmd : 'mceRawembed',
                image : url + '/img/rawembed.png'
            });

            // Add a node change handler, selects the button in the UI when a image is selected
            ed.onNodeChange.add(function(ed, cm, n) {
                cm.setActive('rawembed', n.nodeName == 'IMG');
            });
        },

        /**
        * Creates control instances based in the incomming name. This method is normally not
        * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
        * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
        * method can be used to create those.
        *
        * @param {String} n Name of the control to create.
        * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
        * @return {tinymce.ui.Control} New control instance or null if no control was created.
        */
        createControl : function(n, cm) {
            return null;
        },
        /**
        * Returns information about the plugin as a name/value array.
        * The current keys are longname, author, authorurl, infourl and version.
        *
        * @return {Object} Name/value array containing information about the plugin.
        */
        getInfo : function() {
            return {
                longname : 'Raw Embed Plugin',
                author : 'Joakim Westerlund',
                authorurl : 'http://devcorner.mynewsdesk.com',
                infourl : 'http://devcorner.mynewsdesk.com',
                version : "1.0"
            };
        },
        /**
        * Converts the JSON data object to an img node.
        */
        dataToImg : function(data, force_absolute) {
            var self = this, editor = self.editor, baseUri = editor.documentBaseURI, sources, attrs, img, i;
            data.params.src = data.params.src;

            attrs = data.video.attrs;
            if (attrs)
            attrs.src = attrs.src;
            if (attrs)
            attrs.poster = attrs.poster;
            img = self.editor.dom.create('img', {
                id : data.id,
                style : data.style,
                align : data.align,
                src : self.editor.theme.url + '/img/trans.gif',
                'class' : 'mceItemRawEmbed mceItem' + self.getType(data.type).name,
                'data-mce-json' : JSON.serialize(data, "'")
            });
            img.width = data.width || "320";
            img.height = data.height || "240";
            return img;
        },
        getType : function(value){
            return this.lookup.flash;//We only support flash embed
        },
        /**
        * Converts a tinymce.html.Node image element to video/object/embed.
        */
        imgToObject : function(node, args) {
            var self = this, editor = self.editor, video, object, embed, iframe, name, value, data,
                source, sources, params, param, typeItem, i, item, mp4Source, replacement,
                posterSrc, style;
            data = JSON.parse(node.attr('data-mce-json'));
            typeItem = this.getType(node.attr('class'));

            style = node.attr('data-mce-style');
            if (!style) {
                style = node.attr('style');
                if (style){
                    style = editor.dom.serializeStyle(editor.dom.parseStyle(style, 'img'));
                }
            }
            // Do we have a params src then we can generate object
            if (data.params.src) {
                // Is flv movie add player for it
                if (/\.flv$/i.test(data.params.src)){
                    addPlayer(data.params.src, '');
                }

                if (args && args.force_absolute){
                    data.params.src = editor.documentBaseURI.toAbsolute(data.params.src);
                }

                // Create new object element
                object = new Node('object', 1).attr({
                    id : node.attr('id'),
                    width: node.attr('width'),
                    height: node.attr('height'),
                    style : style
                });

                tinymce.each(rootAttributes, function(name) {
                    if (data[name] && name != 'type'){
                        object.attr(name, data[name]);
                    }
                });

                // Add params
                for (name in data.params) {
                    param = new Node('param', 1);
                    param.shortEnded = true;
                    value = data.params[name];

                    param.attr({name: name, value: value});
                    object.append(param);
                }

                // Setup add type and classid if strict is disabled
                if (this.editor.getParam('media_strict', true)) {
                    object.attr({
                        data: data.params.src,
                        type: typeItem.mimes
                    });
                } else {
                    object.attr({
                        classid: "clsid:" + typeItem.clsids,//test
                        codebase: typeItem.codebase
                    });
                    embed = new Node('embed', 1);
                    embed.shortEnded = true;
                    embed.attr({
                        id: node.attr('id'),
                        width: node.attr('width'),
                        height: node.attr('height'),
                        style : style,
                        type: typeItem.mimes
                    });

                    for (name in data.params){
                        embed.attr(name, data.params[name]);
                    }
                    tinymce.each(rootAttributes, function(name) {
                        if (data[name] && name != 'type'){
                            embed.attr(name, data[name]);
                        }
                    });
                    object.append(embed);
                }
                // Insert raw HTML
                if (data.object_html) {
                    value = new Node('#text', 3);
                    value.raw = true;
                    value.value = data.object_html;
                    object.append(value);
                }
            }
            if (object){
                node.replace(object);
            }else{
                node.remove();
            }
        },        
        /**
        * Converts the JSON data object to a HTML string.
        */
        htmlToData : function(html) {
            var fragment, img, data;

            data = {
                type : 'flash',
                video: {sources:[]},
                params: {}
            };

            fragment = this.editor.parser.parse(html);
            img = fragment.getAll('img')[0];

            if (img) {
                data = JSON.parse(img.attr('data-mce-json'));
                data.type = this.getType(img.attr('class')).name.toLowerCase();

                // Add some extra properties to the data object
                tinymce.each(rootAttributes, function(name) {
                    var value = img.attr(name);

                    if (value){
                        data[name] = value;
                    }
                });
            }

            return data;
        },

        objectToImg : function(node) {
            var object, embed, video, iframe, img, name, id, width, height, style, i, html,
                param, params, source, sources, data, type, matches, attrs, urlConverter = this.editor.settings.url_converter,
                urlConverterScope = this.editor.settings.url_converter_scope, lookup = this.lookup;

            function getInnerHTML(node) {
                return new tinymce.html.Serializer({
                    inner: true,
                    validate: false
                    }).serialize(node);
                };

                // If node isn't in document
                if (!node.parent){
                    return;
                }

                // Setup data objects
                data = data || {
                    video : {},
                    params : {}
                };

                // Setup new image object
                img = new Node('img', 1);
                img.attr({
                    src : this.editor.theme.url + '/img/trans.gif'
                });

                // Object element
                if (node.name === 'object') {
                    object = node;
                    embed = node.getAll('embed')[0];
                }

                // Embed element
                if (node.name === 'embed'){
                    embed = node;
                }

                if (object) {
                    // Get width/height
                    width = width || object.attr('width');
                    height = height || object.attr('height');
                    style = style || object.attr('style');
                    id = id || object.attr('id');

                    // Get all object params
                    params = object.getAll("param");
                    for (i = 0; i < params.length; i++) {
                        param = params[i];
                        name = param.remove().attr('name');
                        if (!excludedAttrs[name]){
                            data.params[name] = param.attr('value');
                        }
                    }

                    data.params.src = data.params.src || object.attr('data');
                }

                if (embed) {
                    // Get width/height
                    width = width || embed.attr('width');
                    height = height || embed.attr('height');
                    style = style || embed.attr('style');
                    id = id || embed.attr('id');

                    // Get all embed attributes
                    for (name in embed.attributes.map) {
                        if (!excludedAttrs[name] && !data.params[name])
                        data.params[name] = embed.attributes.map[name];
                    }
                }

                // Use src not movie
                if (data.params.movie) {
                    data.params.src = data.params.src || data.params.movie;
                    delete data.params.movie;
                }

                // Convert the URL to relative/absolute depending on configuration
                if (data.params.src){
                    data.params.src = urlConverter.call(urlConverterScope, data.params.src, 'src', 'object');
                }

                if (object && !type){
                    type = (lookup[(object.attr('clsid') || '').toLowerCase()] || lookup[(object.attr('type') || '').toLowerCase()] || {}).name;
                }

                if (embed && !type){
                    type = (lookup[(embed.attr('type') || '').toLowerCase()] || {}).name;
                }

                // Replace the video/object/embed element with a placeholder image containing the data
                node.replace(img);

                // Remove embed
                if (embed){
                    embed.remove();
                }

                // Serialize the inner HTML of the object element
                if (object) {
                    html = getInnerHTML(object.remove());
                    if (html){
                        data.object_html = html;
                    }
                }

                // Set width/height of placeholder
                img.attr({
                    id : id,
                    'class' : 'mceItemRawEmbed mceItem' + (type || 'Flash'),
                    style : style,
                    width : width || "320",
                    height : height || "240",
                    "data-mce-json" : JSON.serialize(data, "'")
                });
            }
        });

    // Register plugin
    tinymce.PluginManager.add('rawembed', tinymce.plugins.RawembedPlugin);
})();