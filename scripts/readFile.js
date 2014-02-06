// Generated by CoffeeScript 1.6.3
(function() {
  var readFile,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  readFile = (function() {
    var progress, reader;

    reader = new FileReader();

    progress = document.querySelector('.percent');

    function readFile() {
      this.removeRow = __bind(this.removeRow, this);
      this.reloadRow = __bind(this.reloadRow, this);
      this.listRecentFiles = __bind(this.listRecentFiles, this);
      this.dragFileProc = __bind(this.dragFileProc, this);
      this.handleFileSelect = __bind(this.handleFileSelect, this);
      var fileDrag,
        _this = this;
      db.open({
        server: "BiomData",
        version: 1,
        schema: {
          "biom": {
            key: {
              keyPath: 'id',
              autoIncrement: true
            }
          }
        }
      }).done(function(s) {
        _this.server = s;
        return _this.listRecentFiles();
      });
      document.querySelector('#parse').addEventListener('click', function(evt) {
        var files;
        if (evt.target.tagName.toLowerCase() === 'button') {
          files = document.getElementById('files').files;
          return _this.checkFile(files);
        }
      }, false);
      document.getElementById('files').addEventListener('change', this.handleFileSelect, false);
      fileDrag = document.getElementById('fileDrag');
      fileDrag.addEventListener('dragover', this.dragFileProc, false);
      fileDrag.addEventListener('dragleave', this.dragFileProc, false);
      fileDrag.addEventListener('drop', this.dragFileProc, false);
      fileDrag.addEventListener('drop', this.handleFileSelect, false);
    }

    readFile.prototype.checkFile = function(files) {
      var acceptable_filetype, filetype;
      if (files.length === 0) {
        return alert("Please select a file!");
      } else {
        filetype = files[0].name.split("").reverse().join("").split(".")[0].toLowerCase();
        acceptable_filetype = ["moib", "hcnihp", "txt"];
        if (acceptable_filetype.indexOf(filetype) === -1) {
          return alert("Please upload .biom or .phinch or .txt file!");
        } else {
          return this.readBlob(files[0]);
        }
      }
    };

    readFile.prototype.handleFileSelect = function(evt) {
      progress.style.width = '0%';
      reader.onerror = this.errorHandler;
      reader.onprogress = this.updateProgress;
      reader.onabort = function(e) {
        return alert("File loading cancelled!");
      };
      reader.onloadstart = function(e) {
        return document.getElementById('progress_bar').className = 'loading';
      };
      return reader.onload = function(e) {
        progress.style.width = '100%';
        return setTimeout("document.getElementById('progress_bar').className='';", 8000);
      };
    };

    readFile.prototype.errorHandler = function(evt) {
      switch (evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:
          return alert("File Not Found!");
        case evt.target.error.NOT_READABLE_ERR:
          return alert("File Not Readable!");
        default:
          return alert("File Not Readable!");
      }
    };

    readFile.prototype.updateProgress = function(evt) {
      var percentLoaded;
      if (evt.lengthComputable) {
        percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        if (percentLoaded < 100) {
          return progress.style.width = percentLoaded + '%';
        }
      }
    };

    readFile.prototype.dragFileProc = function(evt) {
      var files;
      evt.stopPropagation();
      evt.preventDefault();
      switch (evt.type) {
        case 'dragover':
          return $('#fileDrag').addClass('hover');
        case 'dragleave':
          return $('#fileDrag').removeClass('hover');
        case 'drop':
          $('#fileDrag').removeClass('hover');
          files = evt.target.files || evt.dataTransfer.files;
          return this.checkFile(files);
      }
    };

    readFile.prototype.readBlob = function(file) {
      var _this = this;
      reader.onloadend = function(evt) {
        var biomToStore;
        if (evt.target.readyState === FileReader.DONE) {
          biomToStore = {};
          biomToStore.name = file.name;
          biomToStore.size = file.size;
          biomToStore.data = evt.target.result;
          if (JSON.parse(biomToStore.data).format.indexOf("Biological Observation Matrix") !== -1) {
            _this.server.biom.add(biomToStore).done(function(item) {
              return this.currentData = item;
            });
            return setTimeout("window.location.href = 'preview.html'", 2000);
          } else {
            return alert("Incorrect biom format field! Please check your file content!");
          }
        }
      };
      return reader.readAsBinaryString(file);
    };

    readFile.prototype.listRecentFiles = function() {
      var _this = this;
      return this.server.biom.query().all().execute().done(function(results) {
        var content, k, _i, _j, _ref, _ref1, _results;
        if (results.length > 0) {
          $('#recent').show();
          _this.currentData = results;
          content = "<table id='recent_data'><thead><tr><th class = 'header'>ID</th><th class = 'header'>Name</th><th class='header'>Size</th><th class='header'>Load</th><th class='header'>Del</th></thead>";
          for (k = _i = 0, _ref = results.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; k = 0 <= _ref ? ++_i : --_i) {
            if (k % 2 === 1) {
              content += '<tr class="recent_data even"><td>';
            } else {
              content += '<tr class="recent_data"><td>';
            }
            content += results[k].id + '</td><td>' + results[k].name.substring(0, 80) + '</td><td>' + (results[k].size / 1000000).toFixed(1) + " MB";
            content += '</td><td class="reload" id="reload_' + k + '"><center><i class="icon-upload-alt icon-large"></i></center>' + '</td><td class="del" id="del_' + k + '"><center><i class="icon-trash icon-large"></i></center></td></tr>';
          }
          content += "</table>";
          $("#recent").append(content);
          _results = [];
          for (k = _j = 0, _ref1 = results.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; k = 0 <= _ref1 ? ++_j : --_j) {
            $('#reload_' + k).click(_this.reloadRow);
            _results.push($('#del_' + k).click(_this.removeRow));
          }
          return _results;
        } else {
          return $('#recent').hide();
        }
      });
    };

    readFile.prototype.reloadRow = function(evt) {
      var biomToStore, i;
      i = evt.currentTarget.id.replace("reload_", "");
      biomToStore = {};
      biomToStore.name = this.currentData[i].name;
      biomToStore.size = this.currentData[i].size;
      biomToStore.data = this.currentData[i].data;
      this.server.biom.add(biomToStore).done(function(item) {
        return this.currentData = item;
      });
      return setTimeout("window.location.href = 'preview.html'", 1000);
    };

    readFile.prototype.removeRow = function(evt) {
      var i;
      i = evt.currentTarget.id.replace("del_", "");
      return this.server.biom.remove(this.currentData[i].id).done(function() {
        return $('#recent_data tr')[parseInt(i) + 1].remove();
      });
    };

    return readFile;

  })();

  window.readFile = readFile;

}).call(this);
