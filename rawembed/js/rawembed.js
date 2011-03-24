tinyMCEPopup.requireLangPack();
var RawEmbedDialog = {
    init : function(){
        this.editor = editor = tinyMCEPopup.editor;
        this.data = editor.selection.getContent();
        document.getElementById("raw-embed").value = this.data;
    },
    insert : function(){
        var editor = tinyMCEPopup.editor;
        var f = document.forms[0], textarea_output, options = '';
        var embed = document.getElementById("raw-embed").value;
        if(embed === "") {
            tinyMCEPopup.close();
        }else{
            editor.execCommand('mceRepaint');
            tinyMCEPopup.restoreSelection();
            this.data = editor.plugins.rawembed.htmlToData(embed);
            editor.selection.setNode(editor.plugins.rawembed.dataToImg(this.data));
            tinyMCEPopup.close();
        }
    }
};
tinyMCEPopup.onInit.add(RawEmbedDialog.init, RawEmbedDialog);