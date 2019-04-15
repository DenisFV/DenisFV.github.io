// ExampleExtension = function ()
// {
// 	this.ext = null;
// };
//
// ExampleExtension.prototype.IsEnabled = function ()
// {
//
// 	return true;
// };
//
// ExampleExtension.prototype.Init = function (extensionInterface)
// {
// 	this.ext = extensionInterface;
// 	var buttonsDiv = this.ext.GetButtonsDiv ()
// 	var buttonImage = $('<img class="knop" >').addClass ('topbutton').attr ('src', 'extensions/example/menu.png').attr ('title', 'Меню').appendTo (buttonsDiv);
// 	var myThis = this;
// 	buttonImage.click (function () {
//
// 		var res = $(".dropdown-menu");
// 		$(".knop").on("click", funk());
//
// 		$(document).click(function(e) {
// 			if ($(e.target).closest(res).length || $(e.target).closest('.knop').length) return;
// 			res.fadeOut(100);
// 			e.stopPropagation();
// 			return;
// 		});
//
// 		function funk(){
// 			if(res.css("display") == "none"){
// 				res.fadeIn(100);
// 			}
// 			else{
// 				res.fadeOut(100);
// 			}
// 		}
//
// 		// alert (JSON.stringify (myThis.ext.GetModelJson ()));
// 		// return myThis.ext.GetModelJson();
// 	});
// };
