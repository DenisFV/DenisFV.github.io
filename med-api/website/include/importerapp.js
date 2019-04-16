ExtensionInterface = function (app)
{
	this.app = app;
};

// ExtensionInterface.prototype.GetButtonsDiv = function ()
// {
// 	return this.app.extensionButtons.GetButtonsDiv ();
// };
//
// ExtensionInterface.prototype.GetModelJson = function ()
// {
// 	return this.app.viewer.GetJsonData ();
// };

ImporterApp = function ()
{
	this.viewer = null;
	this.fileNames = null;
	this.inGenerate = false;
	this.meshesGroup = null;
	this.materialMenuItems = null;
	this.meshMenuItems = null;
	this.extensions = [];
	this.importerButtons = null;
	this.extensionButtons = null;
	this.aboutDialog = null;
	this.isMobile = null;
	this.readyForTest = null;
};

ImporterApp.prototype.Init = function ()
{
	if (!JSM.IsWebGLEnabled () || !JSM.IsFileApiEnabled ()) {
		while (document.body.lastChild) {
			document.body.removeChild (document.body.lastChild);
		}

		var div = $('<div>').addClass ('nosupport').appendTo ($('body'));
		div.html ([
			'<div id="nosupport">',
			this.GetWelcomeText (),
			'<div class="nosupporterror">Вам необходим браузер, который поддерживает следующие технологии: WebGL, WebGLRenderingContext, File, FileReader, FileList, Blob, URL.</div>',
			'</div>'
		].join (''));
		return;
	}

	var myThis = this;
	var top = document.getElementById ('top');
	this.importerButtons = new ImporterButtons (top);
	// this.importerButtons.AddLogo ('Описание', function () { myThis.ShowAboutDialog (); });
	// this.importerButtons.AddButton ('images/menu.png', 'Меню', function () { myThis.ShowMenu (); });
	// this.importerButtons.AddButton ('images/fitinwindow.png', 'Выровнять по центру', function () { myThis.FitInWindow (); });
	// this.importerButtons.AddButton ('images/fitinwindow.png', 'Загрузить файл', function () { myThis.LoadFilesFromHash() });
	this.importerButtons.AddButton ('images/fitinwindow.png', 'Выровнять по центру', function () { myThis.SetNamedView ('c'); });
	// this.importerButtons.AddToggleButton ('images/ruler.png', 'images/rulergray.png', 'Замерить угол', function () { myThis.SetFixUp (); });
	this.importerButtons.AddButton ('images/top.png', 'Вид сверху', function () { myThis.SetNamedView ('t'); });
	this.importerButtons.AddButton ('images/bottom.png', 'Вид снизу', function () { myThis.SetNamedView ('b'); });
	this.importerButtons.AddButton ('images/left.png', 'Вид сбоку', function () { myThis.SetNamedView ('l'); });
	this.importerButtons.AddButton ('images/front.png', 'Вид спереди', function () { myThis.SetNamedView ('f'); });
	this.importerButtons.AddButton ('images/back.png', 'Вид сзади', function () { myThis.SetNamedView ('beh'); });
	// this.importerButtons.AddToggleButton ('images/camera.svg', 'images/camera2.svg', 'Сохрнаить скриншот', function () { myThis.SetFixUp (); });
	this.importerButtons.AddButton ('images/camera2.svg', 'Скрин', function () { myThis.ShowAboutDialog2 (); });
	// this.importerButtons.AddButton ('images/right.png', 'Выровнять по (-X)', function () { myThis.SetNamedView ('-x'); });
	this.importerButtons.AddButton ('images/help.png', 'Помощь', function () { myThis.ShowAboutDialog (); });

	this.extensionButtons = new ExtensionButtons (top);
	this.aboutDialog = new FloatingDialog ();

	var match = window.matchMedia ('(max-device-width : 360px)');
	this.isMobile = match.matches;

	window.addEventListener ('resize', this.Resize.bind (this), false);
	this.Resize ();

	var canvasName = 'example';
	this.RegisterCanvasClick (canvasName);
	this.viewer = new ImporterViewer ();
	this.viewer.Init (canvasName);

	window.addEventListener ('dragover', this.DragOver.bind (this), false);
	window.addEventListener ('drop', this.Drop.bind (this), false);

	var fileInput = document.getElementById ('file');
	fileInput.addEventListener ('change', this.FileSelected.bind (this), false);

	window.onhashchange = this.LoadFilesFromHash.bind (this);
	var hasHashModel = this.LoadFilesFromHash ();
	if (hasHashModel && this.isMobile) {
		this.ShowAboutDialog ();
	}
};

ImporterApp.prototype.ClearReadyForTest = function ()
{
	if (this.readyForTest !== null) {
		this.readyForTest.remove ();
		this.readyForTest = null;
	}
};

ImporterApp.prototype.SetReadyForTest = function ()
{
	this.readyForTest = $('<div>').attr ('id', 'readyfortest').hide ().appendTo ($('body'));
};

ImporterApp.prototype.AddExtension = function (extension)
{
	if (!extension.IsEnabled ()) {
		return;
	}

	var extInterface = new ExtensionInterface (this);
	extension.Init (extInterface);
};

ImporterApp.prototype.ShowMenu = function ()
{
	// var res = $(".dropdown-menu");
	// $(".knop").on("click", funk());
	//
	// $(document).click(function(e) {
	// 	if ($(e.target).closest(res).length || $(e.target).closest('.knop').length) return;
	// 	res.fadeOut(100);
	// 	e.stopPropagation();
	// 	return;
	// });
	//
	// function funk(){
	// 	if(res.css("display") == "none"){
	// 		res.fadeIn(100);
	// 	}
	// 	else{
	// 		res.fadeOut(100);
	// 	}
	// }
};

ImporterApp.prototype.ShowAboutDialog2 = function ()
{
	var dialogText = [
		// '<div class="importerdialog">',
		'<div' +
		' style="width: 80vw; height: 80vh"' +
		'>',
		this.GetWelcomeText2 (),
		'</div>' +
		'<textarea style="width: 100%"></textarea>',
	].join ('');
	this.aboutDialog.Open ({
		title : 'Снимок',
		text : dialogText,
		buttons : [
			{
				text : 'ок',
				callback : function (dialog) {
					dialog.Close ();
				}
			}
		]
	});
};

ImporterApp.prototype.GetWelcomeText2 = function ()
{
	var welcomeText = [
		// '<div class="welcometitle" id="screen" style="padding: 10px; background: #f5da55">'+
		'<div id="screen">'+
		'</div>'+
		'<script>'+
		'html2canvas(document.querySelector("#example")).then(canvas => {'+
		'canvas.style.width = "80vw";' +
		'canvas.style.height = "80vh";' +
		'document.querySelector("#screen").appendChild(canvas);'+
		'context = canvas.getContext("2d");' +
		'context.strokeStyle="#ff0000";' +
		'var mouse = {x: 0, y: 0};' +
		'var draw = false;' +
		'var koefx = 1.25;' +
		'var koefxx = 24.15;' +
			'var koeftx = 3-1;' +
		'var koeftxx = 0.8;' +
		'var koefy = 1.19;' +
		'var koefyy = 1.95;' +
			'var koefty = 2.9-0.3;' +
		'var koeftyy = 1-0.3;' +
		'canvas.addEventListener("mousedown", function (e) {' +
		'            mouse.x = e.pageX*koefx - this.offsetLeft*koefxx;' +
		'            mouse.y = e.pageY*koefy - this.offsetTop*koefyy;' +
		'            draw = true;' +
		'            context.beginPath();' +
		'            context.moveTo(mouse.x, mouse.y);' +
		'        });' +
		'        canvas.addEventListener("mousemove", function (e) {' +
		'            if (draw == true) {' +
		'                mouse.x = e.pageX*koefx - this.offsetLeft*koefxx;' +
		'                mouse.y = e.pageY*koefy - this.offsetTop*koefyy;' +
		'                context.lineTo(mouse.x, mouse.y);' +
		'                context.stroke();' +
		'            }' +
		'        });' +
		'        canvas.addEventListener("mouseup", function (e) {' +
		'            mouse.x = e.pageX*koefx - this.offsetLeft*koefxx;' +
		'            mouse.y = e.pageY*koefy - this.offsetTop*koefyy;' +
		'            context.lineTo(mouse.x, mouse.y);' +
		'            context.stroke();' +
		'            context.closePath();' +
		'            draw = false;' +
		'        });' +

		'canvas.ontouchstart = function(e) {' +
		'			 e.width = document.getElementById("example").width;' +
		'			 e.height = document.getElementById("example").height;' +
		'            if (e.touches) e = e.touches[0];' +
		'            mouse.x = e.pageX*koeftx - this.offsetLeft*koeftxx;' +
		'            mouse.y = e.pageY*koefty - this.offsetTop*koeftyy;' +
		'            draw = true;' +
		'            context.beginPath();' +
		'            context.moveTo(mouse.x, mouse.y);' +
		'            return false;' +
		'        };' +
		'        canvas.ontouchmove = function(e){' +
		'            if (e.touches) e = e.touches[0];' +
		'            if (draw == true) {' +
		'                mouse.x = e.pageX*koeftx - this.offsetLeft*koeftxx;' +
		'                mouse.y = e.pageY*koefty - this.offsetTop*koeftyy;' +
		'                context.lineTo(mouse.x, mouse.y);' +
		'                context.stroke();' +
		'            }' +
		'            return false;' +
		'        };' +
		'        canvas.ontouchend = function(e){' +
		'            if (e.touches) e = e.touches[0];' +
		'            mouse.x = e.pageX*koeftx - this.offsetLeft*koeftxx;' +
		'            mouse.y = e.pageY*koefty - this.offsetTop*koeftyy;' +
		'            context.lineTo(mouse.x, mouse.y);' +
		'            context.stroke();' +
		'            context.closePath();' +
		'            draw = false;' +
		'            return false;' +
		'        };' +
		'});'+
		'</script>',
	].join ('');
	return welcomeText;
};





ImporterApp.prototype.ShowAboutDialog = function ()
{
	var dialogText = [
		'<div class="importerdialog">',
		this.GetWelcomeText (),
		'</div>',
	].join ('');
	this.aboutDialog.Open ({
		title : 'Описание',
		text : dialogText,
		buttons : [
			{
				text : 'ок',
				callback : function (dialog) {
					dialog.Close ();
				}
			}
		]
	});
};

ImporterApp.prototype.GetWelcomeText = function ()
{
	var welcomeText = [
		'<table>' +
		'<tr>' +
		'<td style="background: linear-gradient(#333333, #111111) #222222;"><span class="welcometitle"><img src="images/fitinwindow.png"/></span></td>' +
		'<td><span class="welcometitle" style="color: #006d91"> - Выровнять по центру</span></td>' +
		'</tr>' +
		'<tr>' +
		'<td style="background: linear-gradient(#333333, #111111) #222222;"><span class="welcometitle"><img src="images/top.png"/></span></td>' +
		'<td><span class="welcometitle" style="color: #006d91"> - Повернуть в указанное положение</span></td>' +
		'</tr>' +
		'<tr>' +
		'<td style="background: linear-gradient(#333333, #111111) #222222;"><span class="welcometitle"><img src="images/camera2.svg"/></span></td>' +
		'<td><span class="welcometitle" style="color: #006d91"> - Сделать скриншот</span></td>' +
		'</tr>' +
		'<tr>' +
		'<td style="background: linear-gradient(#333333, #111111) #222222;"><span class="welcometitle"><img src="images/help.png"/></span></td>' +
		'<td><span class="welcometitle" style="color: #006d91"> - Описание</span></td>' +
		'</tr>' +
		'</table>',
	].join ('');
	return welcomeText;
};

ImporterApp.prototype.Resize = function ()
{
	function SetWidth (elem, value)
	{
		elem.width = value;
		elem.style.width = value + 'px';
	}

	function SetHeight (elem, value)
	{
		elem.height = value;
		elem.style.height = value + 'px';
	}

	var top = document.getElementById ('top');
	// var left = document.getElementById ('left');
	var canvas = document.getElementById ('example');
	var height = document.body.clientHeight - top.offsetHeight;

	SetHeight (canvas, 0);
	SetWidth (canvas, 0);

	// SetHeight (left, height);

	SetHeight (canvas, height);
	SetWidth (canvas, document.body.clientWidth);

	this.aboutDialog.Resize ();
};

ImporterApp.prototype.JsonLoaded = function (progressBar)
{
	this.Generate (progressBar);
};

ImporterApp.prototype.GenerateMenu = function ()
{
// 	function AddDefaultGroup (menu, name, id)
// 	{
// 		var group = menu.AddGroup (name, {
// 			id : id,
// 			openCloseButton : {
// 				title : 'Show/Hide ' + name
// 			}
// 		});
// 		return group;
// 	}
//
// 	function AddInformation (infoGroup, jsonData)
// 	{
// 		var infoTable = new InfoTable (infoGroup.GetContentDiv ());
//
// 		var materialCount = jsonData.materials.length;
// 		var materialCount = jsonData.materials.length;
// 		var materialCount = jsonData.materials.length;
// 		var vertexCount = 0;
// 		var triangleCount = 0;
//
// 		var i, j, mesh, triangles;
// 		for (i = 0; i < jsonData.meshes.length; i++) {
// 			mesh = jsonData.meshes[i];
// 			vertexCount += mesh.vertices.length / 3;
// 			for (j = 0; j < mesh.triangles.length; j++) {
// 				triangles = mesh.triangles[j];
// 				triangleCount += triangles.parameters.length / 9;
// 			}
// 		}
//
// 		infoTable.AddRow ('Material count', materialCount);
// 		infoTable.AddRow ('Material count2', materialCount2);
// 		infoTable.AddRow ('Material count3', materialCount3);
// 		infoTable.AddRow ('Vertex count', vertexCount);
// 		infoTable.AddRow ('Triangle count', triangleCount);
// 	}
//
// 	function AddMaterial (importerApp, importerMenu, materialsGroup, materialIndex, material)
// 	{
// 		var materialMenuItem = materialsGroup.AddSubItem (material.name, {
// 			openCloseButton : {
// 				title : 'Show/Hide Information',
// 				onOpen : function (contentDiv, material) {
// 					contentDiv.empty ();
// 					var materialButtons = $('<div>').addClass ('submenubuttons').appendTo (contentDiv);
// 					var highlightButton = $('<img>').addClass ('submenubutton').attr ('src', 'images/highlightmesh.png').attr ('title', 'Highlight Meshes By Material').appendTo (materialButtons);
// 					highlightButton.click (function () {
// 						importerApp.HighlightMeshesByMaterial (materialIndex);
// 					});
// 					var fitInWindowButton = $('<img>').addClass ('submenubutton').attr ('src', 'images/fitinwindowsmall.png').attr ('title', 'Fit Meshes In Window By Material').appendTo (materialButtons);
// 					fitInWindowButton.click (function () {
// 						importerApp.FitMeshesByMaterialInWindow (materialIndex);
// 					});
// 					var table = new InfoTable (contentDiv);
// 					table.AddColorRow ('Ambient', material.ambient);
// 					table.AddColorRow ('Diffuse', material.diffuse);
// 					table.AddColorRow ('Specular', material.specular);
// 					table.AddRow ('Shininess', material.shininess.toFixed (2));
// 					table.AddRow ('Opacity', material.opacity.toFixed (2));
// 				},
// 				userData : material
// 			}
// 		});
// 		return materialMenuItem;
// 	}
//
// 	function AddMesh (importerApp, importerMenu, meshesGroup, mesh, meshIndex)
// 	{
// 		function AddMeshButtons (importerApp, contentDiv, meshName, meshIndex)
// 		{
// 			function CopyToClipboard (text) {
// 				var input = document.createElement ('input');
// 				input.style.position = 'absolute';
// 				input.style.left = '0';
// 				input.style.top = '0';
// 				input.setAttribute ('value', text);
// 				document.body.appendChild (input);
// 				input.select ();
// 				document.execCommand ('copy');
// 				document.body.removeChild(input);
// 			}
//
// 			var meshButtons = $('<div>').addClass ('submenubuttons').appendTo (contentDiv);
// 			var fitInWindowButton = $('<img>').addClass ('submenubutton').attr ('src', 'images/fitinwindowsmall.png').attr ('title', 'Fit Mesh In Window').appendTo (meshButtons);
// 			fitInWindowButton.click (function () {
// 				importerApp.FitMeshInWindow (meshIndex);
// 			});
// 			var highlightButton = $('<img>').addClass ('submenubutton').attr ('src', 'images/highlightmesh.png').attr ('title', 'Highlight Mesh').appendTo (meshButtons);
// 			highlightButton.click (function () {
// 				importerApp.HighlightMesh (meshIndex);
// 			});
// 			var copyNameToClipboardButton = $('<img>').addClass ('submenubutton').attr ('src', 'images/copytoclipboard.png').attr ('title', 'Copy Mesh Name To Clipboard').appendTo (meshButtons);
// 			copyNameToClipboardButton.click (function () {
// 				CopyToClipboard (meshName);
// 			});
// 		}
//
// 		var visibleImage = null;
// 		var meshMenuItem = meshesGroup.AddSubItem (mesh.name, {
// 			id : 'meshmenuitem-' + meshIndex.toString (),
// 			openCloseButton : {
// 				title : 'Show/Hide Details',
// 				onOpen : function (contentDiv, mesh) {
// 					contentDiv.empty ();
//
// 					AddMeshButtons (importerApp, contentDiv, mesh.name, meshIndex);
// 					var table = new InfoTable (contentDiv);
//
// 					var min = new JSM.Coord (JSM.Inf, JSM.Inf, JSM.Inf);
// 					var max = new JSM.Coord (-JSM.Inf, -JSM.Inf, -JSM.Inf);
// 					var i, vertex;
// 					for (i = 0; i < mesh.vertices.length; i =  i + 3) {
// 						vertex = new JSM.Coord (mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]);
// 						min.x = JSM.Minimum (min.x, vertex.x);
// 						min.y = JSM.Minimum (min.y, vertex.y);
// 						min.z = JSM.Minimum (min.z, vertex.z);
// 						max.x = JSM.Maximum (max.x, vertex.x);
// 						max.y = JSM.Maximum (max.y, vertex.y);
// 						max.z = JSM.Maximum (max.z, vertex.z);
// 					}
// 					table.AddRow ('X Size', (max.x - min.x).toFixed (2));
// 					table.AddRow ('Y Size', (max.y - min.y).toFixed (2));
// 					table.AddRow ('Z Size', (max.z - min.z).toFixed (2));
//
// 					var triangleCount = 0;
// 					var triangles;
// 					for (i = 0; i < mesh.triangles.length; i++) {
// 						triangles = mesh.triangles[i];
// 						triangleCount += triangles.parameters.length / 9;
// 					}
//
// 					table.AddRow ('Vertex count', mesh.vertices.length / 3);
// 					table.AddRow ('Triangle count', triangleCount);
// 				},
// 				userData : mesh
// 			},
// 			userButtons : [
// 				{
// 					id : 'showhidemesh-' + meshIndex,
// 					title : 'Show/Hide Mesh',
// 					onCreate : function (image) {
// 						image.attr ('src', 'images/visible.png');
// 						visibleImage = image;
// 					},
// 					onClick : function (image, meshIndex) {
// 						importerApp.ShowHideMesh (meshIndex);
// 					},
// 					onCtrlClick : function (image, meshIndex) {
// 						importerApp.IsolateMesh (meshIndex);
// 					},
// 					userData : meshIndex
// 				}
// 			]
// 		});
//
// 		meshMenuItem.isVisible = true;
// 		meshMenuItem.visibleImage = visibleImage;
// 		return meshMenuItem;
// 	}
//
// 	var jsonData = this.viewer.GetJsonData ();
	var menu = $('#menu');
	menu.css ('display', 'none');
	// var res = $("#left");
	// res.css ('display', 'none');

	// var ex = $("#example");

	// ex.css('width',window.innerWidth.valueOf());
	// ex.css('height',window.innerHeight.valueOf());

	// var importerMenu = new ImporterMenu (menu);
	//
	// var filesGroup = AddDefaultGroup (importerMenu, 'Files', 'filesmenuitem');
	// filesGroup.AddSubItem (this.fileNames.main);
	// var i;
	// for (i = 0; i < this.fileNames.requested.length; i++) {
	// 	filesGroup.AddSubItem (this.fileNames.requested[i]);
	// }
	//
	// if (this.fileNames.missing.length > 0) {
	// 	var missingFilesGroup = AddDefaultGroup (importerMenu, 'Missing Files', 'missingfilesmenuitem');
	// 	for (i = 0; i < this.fileNames.missing.length; i++) {
	// 		missingFilesGroup.AddSubItem (this.fileNames.missing[i]);
	// 	}
	// }
	//
	// var infoGroup = AddDefaultGroup (importerMenu, 'Information', 'informationmenuitem');
	// AddInformation (infoGroup, jsonData);
	//
	// this.materialMenuItems = [];
	// var materialsGroup = AddDefaultGroup (importerMenu, 'Materials', 'materialsmenuitem');
	// var material, materialMenuItem;
	// for (i = 0; i < jsonData.materials.length; i++) {
	// 	material = jsonData.materials[i];
	// 	materialMenuItem = AddMaterial (this, importerMenu, materialsGroup, i, material);
	// 	this.materialMenuItems.push (materialMenuItem);
	// }
	//
	// this.meshesGroup = AddDefaultGroup (importerMenu, 'Meshes', 'meshesmenuitem');
	// this.meshMenuItems = [];
	// var mesh, meshMenuItem;
	// for (i = 0; i < jsonData.meshes.length; i++) {
	// 	mesh = jsonData.meshes[i];
	// 	meshMenuItem = AddMesh (this, importerMenu, this.meshesGroup, mesh, i);
	// 	this.meshMenuItems.push (meshMenuItem);
	// }
};

ImporterApp.prototype.GenerateError = function (errorMessage)
{
	this.viewer.RemoveMeshes ();
	var menu = $('#menu');
	menu.empty ();

	this.aboutDialog.Open ({
		title : 'Error',
		text : '<div class="importerdialog">' + errorMessage + '</div>',
		buttons : [
			{
				text : 'ok',
				callback : function (dialog) {
					dialog.Close ();
				}
			}
		]
	});
};

ImporterApp.prototype.Generate = function (progressBar)
{
	function ShowMeshes (importerApp, progressBar, merge)
	{
		importerApp.inGenerate = true;
		var environment = {
			onStart : function (taskCount) {
				progressBar.Init (taskCount);
			},
			onProgress : function (currentTask) {
				progressBar.Step (currentTask + 1);
			},
			onFinish : function () {
				importerApp.GenerateMenu ();
				importerApp.inGenerate = false;
				importerApp.SetReadyForTest ();
			}
		};

		if (merge) {
			var jsonData = importerApp.viewer.GetJsonData ();
			importerApp.viewer.SetJsonData (JSM.MergeJsonDataMeshes (jsonData));
		}
		importerApp.viewer.ShowAllMeshes (environment);
	}

	var jsonData = this.viewer.GetJsonData ();
	if (jsonData.materials.length === 0 || jsonData.meshes.length === 0) {
		this.GenerateError ('Failed to open file. Maybe something is wrong with your file.');
		this.SetReadyForTest ();
		return;
	}

	var myThis = this;
	if (jsonData.meshes.length > 250) {
		this.aboutDialog.Open ({
			title : 'Information',
			text : '<div class="importerdialog">The model contains a large number of meshes. It can cause performance problems. Would you like to merge meshes?</div>',
			buttons : [
				{
					text : 'yes',
					callback : function (dialog) {
						ShowMeshes (myThis, progressBar, true);
						dialog.Close ();
					}
				},
				{
					text : 'no',
					callback : function (dialog) {
						ShowMeshes (myThis, progressBar, false);
						dialog.Close ();
					}
				}
			]
		});
	} else {
		ShowMeshes (myThis, progressBar, false);
	}
};

// ImporterApp.prototype.FitInWindow = function ()
// {
// 	this.viewer.FitInWindow ();
// };
//
// ImporterApp.prototype.FitMeshInWindow = function (meshIndex)
// {
// 	this.viewer.FitMeshInWindow (meshIndex);
// };

// ImporterApp.prototype.FitMeshesByMaterialInWindow = function (materialIndex)
// {
// 	var meshIndices = this.viewer.GetMeshesByMaterial (materialIndex);
// 	if (meshIndices.length === 0) {
// 		return;
// 	}
// 	this.viewer.FitMeshesInWindow (meshIndices);
// };

ImporterApp.prototype.SetFixUp = function ()
{
	this.viewer.SetFixUp ();
};

ImporterApp.prototype.SetNamedView = function (viewName)
{
	this.viewer.SetNamedView (viewName);
};

ImporterApp.prototype.SetView = function (viewType)
{
	this.viewer.SetView (viewType);
};

// ImporterApp.prototype.ShowHideMesh = function (meshIndex)
// {
// 	var meshMenuItem = this.meshMenuItems[meshIndex];
// 	this.ShowHideMeshInternal (meshIndex, !meshMenuItem.isVisible);
// 	this.viewer.Draw ();
// };

// ImporterApp.prototype.IsolateMesh = function (meshIndex)
// {
// 	var i, meshMenuItem;
//
// 	var onlyThisVisible = true;
// 	if (!this.meshMenuItems[meshIndex].isVisible) {
// 		onlyThisVisible = false;
// 	} else {
// 		for (i = 0; i < this.meshMenuItems.length; i++) {
// 			meshMenuItem = this.meshMenuItems[i];
// 			if (meshMenuItem.isVisible && i !== meshIndex) {
// 				onlyThisVisible = false;
// 				break;
// 			}
// 		}
// 	}
//
// 	var i;
// 	for (i = 0; i < this.meshMenuItems.length; i++) {
// 		if (onlyThisVisible) {
// 			this.ShowHideMeshInternal (i, true);
// 		} else {
// 			if (i == meshIndex) {
// 				this.ShowHideMeshInternal (i, true);
// 			} else {
// 				this.ShowHideMeshInternal (i, false);
// 			}
// 		}
// 	}
//
// 	this.viewer.Draw ();
// };

// ImporterApp.prototype.ShowHideMeshInternal = function (meshIndex, isVisible)
// {
// 	var meshMenuItem = this.meshMenuItems[meshIndex];
// 	meshMenuItem.isVisible = isVisible;
// 	meshMenuItem.visibleImage.attr ('src', meshMenuItem.isVisible ? 'images/visible.png' : 'images/hidden.png');
// 	this.viewer.ShowMesh (meshIndex, meshMenuItem.isVisible);
// };

ImporterApp.prototype.HighlightMeshInternal = function (meshIndex, highlight)
{
	var meshMenuItem = this.meshMenuItems[meshIndex];
	meshMenuItem.Highlight (highlight);
	this.viewer.HighlightMesh (meshIndex, highlight);
};

ImporterApp.prototype.ProcessFiles = function (fileList, isUrl)
{
	this.ClearReadyForTest ();
	this.aboutDialog.Close ();
	if (this.inGenerate) {
		return;
	}

	var userFiles = fileList;
	if (userFiles.length === 0) {
		return;
	}

	this.fileNames = null;

	var myThis = this;
	var processorFunc = JSM.ConvertFileListToJsonData;
	if (isUrl) {
		processorFunc = JSM.ConvertURLListToJsonData;
	}

	var menu = $('#menu');
	menu.empty ();
	if (isUrl) {
		menu.html ('Downloading files...');
	} else {
		menu.html ('Loading files...');
	}

	processorFunc (userFiles, {
		onError : function () {
			myThis.GenerateError ('No readable file found. You can open 3ds, obj, stl, and off files.');
			myThis.SetReadyForTest ();
			return;
		},
		onReady : function (fileNames, jsonData) {
			myThis.fileNames = fileNames;
			myThis.viewer.SetJsonData (jsonData);
			menu.empty ();
			var progressBar = new ImporterProgressBar (menu);
			myThis.JsonLoaded (progressBar);
		}
	});
};

ImporterApp.prototype.RegisterCanvasClick = function (canvasName)
{
	var myThis = this;
	var canvas = $('#' + canvasName);
	var mouseMoved = false;
	canvas.mousedown (function () {
		mouseMoved = false;
	});
	canvas.mouseup (function (event) {
		if (!mouseMoved) {
			var x = event.pageX;
			var y = event.pageY - $(this).offset ().top;
			myThis.OnCanvasClick (x, y);
		}
		mouseMoved = false;
	});
	canvas.mousemove (function () {
		mouseMoved = true;
	});
};

ImporterApp.prototype.ScrollMeshIntoView = function (meshIndex)
{
	if (meshIndex == -1) {
		return;
	}
	var menuItem = this.meshMenuItems[meshIndex];
	menuItem.menuItemDiv.get (0).scrollIntoView ();
};

ImporterApp.prototype.HighlightMesh = function (meshIndex)
{
	var i, menuItem, highlight;
	if (meshIndex != -1) {
		for (i = 0; i < this.meshMenuItems.length; i++) {
			menuItem = this.meshMenuItems[i];
			highlight = false;
			if (i == meshIndex) {
				if (!menuItem.IsHighlighted ()) {
					this.HighlightMeshInternal (i, true);
				} else {
					this.HighlightMeshInternal (i, false);
				}
			}
		}
	} else {
		for (i = 0; i < this.meshMenuItems.length; i++) {
			menuItem = this.meshMenuItems[i];
			if (menuItem.IsHighlighted ()) {
				this.HighlightMeshInternal (i, false);
			}
		}
	}

	this.viewer.Draw ();
};

// ImporterApp.prototype.HighlightMeshesByMaterial = function (materialIndex)
// {
// 	var meshIndices = this.viewer.GetMeshesByMaterial (materialIndex);
// 	if (meshIndices.length === 0) {
// 		return;
// 	}
//
// 	var i, meshIndex, meshMenuItem;
// 	this.HighlightMesh (-1);
// 	for (i = 0; i < meshIndices.length; i++) {
// 		meshIndex = meshIndices[i];
// 		meshMenuItem = this.meshMenuItems[meshIndex];
// 		this.HighlightMeshInternal (meshIndex, true);
// 	}
//
// 	this.meshesGroup.SetOpen (true);
// 	this.ScrollMeshIntoView (meshIndices[0]);
// 	this.viewer.Draw ();
// };

ImporterApp.prototype.OnCanvasClick = function (x, y)
{
	var objects = this.viewer.GetMeshesUnderPosition (x, y);
	var meshIndex = -1;
	if (objects.length > 0) {
		meshIndex = objects[0].originalJsonMeshIndex;
		this.meshesGroup.SetOpen (true);
	}

	this.HighlightMesh (meshIndex);
	this.ScrollMeshIntoView (meshIndex);
};

ImporterApp.prototype.DragOver = function (event)
{
	event.stopPropagation ();
	event.preventDefault ();
	event.dataTransfer.dropEffect = 'copy';
};

ImporterApp.prototype.Drop = function (event)
{
	event.stopPropagation ();
	event.preventDefault ();
	this.ResetHash ();
	this.ProcessFiles (event.dataTransfer.files, false);
};

ImporterApp.prototype.FileSelected = function (event)
{
	event.stopPropagation ();
	event.preventDefault ();
	this.ResetHash ();
	this.ProcessFiles (event.target.files, false);
};

ImporterApp.prototype.ResetHash = function ()
{
	if (window.location.hash.length > 1) {
		window.location.hash = '';
	}
};

ImporterApp.prototype.LoadFilesFromHash = function ()
{
	if (window.location.hash.length < 2) {
		return false;
	}

	var fileInput = $('#file');
	var hash = window.location.hash;
	if (hash == '#testmode') {
		fileInput.css ('display', '');
		fileInput.css ('position', 'absolute');
		fileInput.css ('right', '10px');
		fileInput.css ('bottom', '10px');
		return false;
	}

	fileInput.css ('display', 'none');
	var hash = hash.substr (1, hash.length - 1);
	var fileList = hash.split (',');
	this.ProcessFiles (fileList, true);
	return true;
};

window.onload = function ()
{
	var importerApp = new ImporterApp ();
	importerApp.Init ();
	// ExtensionIncludes
	importerApp.AddExtension (new ExampleExtension ());
	// ExtensionIncludesEnd
};
