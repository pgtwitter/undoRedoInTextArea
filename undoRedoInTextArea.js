// https://github.com/pgtwitter/undoRedoInTextArea
;
(function() {
	document.newUndoRedoObject = function(textareaId) {
		var textArea = document.getElementById(textareaId);
		return new undoRedoObject(textArea);
	};

	var KEY_CODE_Z = 90;

	function undoRedoObject(textArea) {
		var _self = textArea;
		var _debug = false;

		//--
		var _undos;
		var _redos;
		var _prevValue;
		var _prevSelection;
		var _isComosition;

		//--
		init();

		//--
		this.init = init;

		function init() {
			_undos = [];
			_redos = [];
			_prevValue = _self.value;
			_prevSelection = [_self.selectionStart, _self.selectionEnd];
			_isComosition = false;
		}

		//--
		_self.addEventListener('keydown', function(evt) {
			if (_debug) console.log('keydown');
			if (_isComosition) return;
			var textArea = this;
			var isMeta = evt.metaKey || evt.ctrlKey;
			if (evt.keyCode != KEY_CODE_Z || !isMeta) return;
			evt.stopPropagation();
			evt.preventDefault();
			var f = (evt.shiftKey) ? redo : undo;
			f(textArea, evt);
		});
		_self.addEventListener('keyup', function(evt) {
			if (_debug) console.log('keyup');
			if (_isComosition) return;
			var textArea = this;
			var isMeta = evt.metaKey || evt.ctrlKey;
			if (evt.keyCode == KEY_CODE_Z && isMeta) return;
			doCommand(createCommand(textArea, evt));
		});

		//--
		function createCommand(textArea, evt) {
			var currentValue = textArea.value;
			var currentSelection = [textArea.selectionStart, textArea.selectionEnd];
			var cmd = {
				value: [_prevValue, currentValue],
				selection: [_prevSelection, currentSelection],
			};
			_prevValue = currentValue;
			_prevSelection = currentSelection;
			return cmd;
		}

		function doCommand(cmd) {
			if (cmd.value[0] == cmd.value[1]) {
				var lastCmd = _undos.pop();
				if (!lastCmd) return;
				lastCmd.selection[1] = cmd.selection[1];
				cmd = lastCmd;
			}
			_undos.push(cmd);
			_redos = [];

		}

		function undo(textArea, evt) {
			undoRedo(textArea, evt, _undos, _redos);
		}

		function redo(textArea, evt) {
			undoRedo(textArea, evt, _redos, _undos);
		}

		function undoRedo(textArea, evt, from, to) {
			var cmd = from.pop();
			if (!cmd) return;
			textArea.value = cmd.value[0];
			textArea.selectionStart = cmd.selection[0][0];
			textArea.selectionEnd = cmd.selection[0][1];
			to.push(createCommand(textArea, evt));
		}

		//--
		[
			['compositionstart', true],
			['compositionupdate', true],
			['compositionend', false]
		].forEach(function(o, i) {
			_self.addEventListener(o[0], function(evt) {
				if (_debug) console.log(o[0]);
				_isComosition = o[1];
			});
		});

		//--
		['cut', 'paste', 'drop'].forEach(function(o, i) {
			_self.addEventListener(o, function(evt) {
				if (_debug) console.log(o)
				var textArea = this;
				setTimeout(function() {
					if (_debug) console.log(o + '1', self.value);
					_prevSelection = [textArea.selectionStart, textArea.selectionEnd];
					doCommand(createCommand(textArea, evt));
				}, 0);
			});
		});
	}
})();
