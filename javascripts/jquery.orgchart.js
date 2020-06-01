/*
 * jQuery OrgChart Plugin
 * https://github.com/dabeng/OrgChart
 *
 * Copyright 2016, dabeng
 * https://github.com/dabeng
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Lightly adapted in May 2020 for use at UPE Nu Chapter by Leon Ming
 *
 */
'use strict';

(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    factory(require('jquery'), window, document);
  } else {
    factory(jQuery, window, document);
  }
}(function ($, window, document, undefined) {
  var OrgChart = function (elem, opts) {
    this.$chartContainer = $(elem);
    this.opts = opts;
    this.defaultOptions = {
      'nodeTitle': 'name',
      'nodeContent': 'year',
      'toggleSiblingsResp': false,
      'visibleLevel': 999,
      'chartClass': '',
      'exportButton': false,
      'exportFilename': 'UPE Family OrgChart',
      'exportFileextension': 'png',
      'parentNodeSymbol': 'oci-leader',
      'draggable': false,
      'direction': 't2b',
      'pan': false,
      'zoom': false,
      'zoominLimit': 2,
      'zoomoutLimit': 0.5
    };
  };
  //
  OrgChart.prototype = {
    // Create the html elements, and bind relevant listeners
    init: function () {
      var that = this;
      this.options = $.extend({}, this.defaultOptions, this.opts);

      var $chartContainer = this.$chartContainer;
      if (this.$chart) {
        this.$chart.remove();
      }
      var data = this.options.data;
      var $chart = this.$chart = $('<div>', {
        'data': { 'options': this.options },
        'class': 'orgchart'
      });
      this.buildHierarchy($chart, this.attachRel(data, '00'), 0, 1);
      $chartContainer.append($chart);

      $chart.scrollLeft(($chart.find('.fam:first-child').width() - $chart.width()) / 2);

      if (this.options.exportButton && !$chartContainer.find('.oc-export-btn').length) {
        this.attachExportButton();
      }

      if (this.options.pan) {
        this.bindPan();
      }

      if (this.options.zoom) {
        this.bindZoom();
      }

      return this;
    },

    //
    // EXPORTING
    //

    attachExportButton: function () {
      var that = this;
      var $exportBtn = $('<button>', {
        'class': 'oc-export-btn' + (this.options.chartClass !== '' ? ' ' + this.options.chartClass : ''),
        'text': 'Export',
        'click': function(e) {
          e.preventDefault();
          that.export();
        }
      });
      this.$chartContainer.append($exportBtn);
    },

    //
    // PANNING
    //

    panStartHandler: function (e) {
      var $chart = $(e.delegateTarget);
      if ($(e.target).closest('.node').length || (e.touches && e.touches.length > 1)) {
        $chart.data('panning', false);
        return;
      } else {
        $chart.css('cursor', 'move').data('panning', true);
      }
      var lastX = 0;
      var lastY = 0;
      var lastTf = $chart.css('transform');
      if (lastTf !== 'none') {
        var temp = lastTf.split(',');
        if (lastTf.indexOf('3d') === -1) {
          lastX = parseInt(temp[4]);
          lastY = parseInt(temp[5]);
        } else {
          lastX = parseInt(temp[12]);
          lastY = parseInt(temp[13]);
        }
      }
      var startX = 0;
      var startY = 0;
      if (!e.targetTouches) { // pand on desktop
        startX = e.pageX - lastX;
        startY = e.pageY - lastY;
      } else if (e.targetTouches.length === 1) { // pan on mobile device
        startX = e.targetTouches[0].pageX - lastX;
        startY = e.targetTouches[0].pageY - lastY;
      } else if (e.targetTouches.length > 1) {
        return;
      }
      $chart.on('mousemove touchmove',function(e) {
        if (!$chart.data('panning')) {
          return;
        }
        var newX = 0;
        var newY = 0;
        if (!e.targetTouches) { // pand on desktop
          newX = e.pageX - startX;
          newY = e.pageY - startY;
        } else if (e.targetTouches.length === 1) { // pan on mobile device
          newX = e.targetTouches[0].pageX - startX;
          newY = e.targetTouches[0].pageY - startY;
        } else if (e.targetTouches.length > 1) {
          return;
        }
        var lastTf = $chart.css('transform');
        if (lastTf === 'none') {
          if (lastTf.indexOf('3d') === -1) {
            $chart.css('transform', 'matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')');
          } else {
            $chart.css('transform', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + newX + ', ' + newY + ', 0, 1)');
          }
        } else {
          var matrix = lastTf.split(',');
          if (lastTf.indexOf('3d') === -1) {
            matrix[4] = ' ' + newX;
            matrix[5] = ' ' + newY + ')';
          } else {
            matrix[12] = ' ' + newX;
            matrix[13] = ' ' + newY;
          }
          $chart.css('transform', matrix.join(','));
        }
      });
    },
    panEndHandler: function (e) {
      if (e.data.chart.data('panning')) {
        e.data.chart.data('panning', false).css('cursor', 'default').off('mousemove');
      }
    },
    bindPan: function () {
      this.$chartContainer.css('overflow', 'slide-up');
      this.$chart.on('mousedown touchstart', this.panStartHandler);
      $(document).on('mouseup touchend', { 'chart': this.$chart }, this.panEndHandler);
    },
    unbindPan: function () {
      this.$chartContainer.css('overflow', 'auto');
      this.$chart.off('mousedown touchstart', this.panStartHandler);
      $(document).off('mouseup touchend', this.panEndHandler);
    },

    //
    // ZOOMING
    //

    zoomWheelHandler: function (e) {
      var oc = e.data.oc;
      e.preventDefault();
      var newScale  = 1 + (e.originalEvent.deltaY > 0 ? -0.2 : 0.2);
      oc.setChartScale(oc.$chart, newScale);
    },
    zoomStartHandler: function (e) {
      if(e.touches && e.touches.length === 2) {
        var oc = e.data.oc;
        oc.$chart.data('pinching', true);
        var dist = oc.getPinchDist(e);
        oc.$chart.data('pinchDistStart', dist);
      }
    },
    zoomingHandler: function (e) {
      var oc = e.data.oc;
      if(oc.$chart.data('pinching')) {
        var dist = oc.getPinchDist(e);
        oc.$chart.data('pinchDistEnd', dist);
      }
    },
    zoomEndHandler: function (e) {
      var oc = e.data.oc;
      if(oc.$chart.data('pinching')) {
        oc.$chart.data('pinching', false);
        var diff = oc.$chart.data('pinchDistEnd') - oc.$chart.data('pinchDistStart');
        if (diff > 0) {
          oc.setChartScale(oc.$chart, 1.2);
        } else if (diff < 0) {
          oc.setChartScale(oc.$chart, 0.8);
        }
      }
    },
    bindZoom: function () {
      this.$chartContainer.on('wheel', { 'oc': this }, this.zoomWheelHandler);
      this.$chartContainer.on('touchstart', { 'oc': this }, this.zoomStartHandler);
      $(document).on('touchmove', { 'oc': this }, this.zoomingHandler);
      $(document).on('touchend', { 'oc': this }, this.zoomEndHandler);
    },
    unbindZoom: function () {
      this.$chartContainer.off('wheel', this.zoomWheelHandler);
      this.$chartContainer.off('touchstart', this.zoomStartHandler);
      $(document).off('touchmove', this.zoomingHandler);
      $(document).off('touchend', this.zoomEndHandler);
    },
    getPinchDist: function (e) {
      return Math.sqrt((e.touches[0].clientX - e.touches[1].clientX) * (e.touches[0].clientX - e.touches[1].clientX) +
      (e.touches[0].clientY - e.touches[1].clientY) * (e.touches[0].clientY - e.touches[1].clientY));
    },
    setChartScale: function ($chart, newScale) {
      var opts = $chart.data('options');
      var lastTf = $chart.css('transform');
      var matrix = '';
      var targetScale = 1;
      if (lastTf === 'none') {
        $chart.css('transform', 'scale(' + newScale + ',' + newScale + ')');
      } else {
        matrix = lastTf.split(',');
        if (lastTf.indexOf('3d') === -1) {
          targetScale = Math.abs(window.parseFloat(matrix[3]) * newScale);
          if (targetScale > opts.zoomoutLimit && targetScale < opts.zoominLimit) {
            $chart.css('transform', lastTf + ' scale(' + newScale + ',' + newScale + ')');
          }
        } else {
          targetScale = Math.abs(window.parseFloat(matrix[1]) * newScale);
          if (targetScale > opts.zoomoutLimit && targetScale < opts.zoominLimit) {
            $chart.css('transform', lastTf + ' scale3d(' + newScale + ',' + newScale + ', 1)');
          }
        }
      }
    },

    //
    // HELPERS
    //

    // Give nodes knowledge of their relatives
    attachRel: function (data, flags) {
      var that = this;
      data.relationship = flags + (data.children && data.children.length > 0 ? 1 : 0);
      if (data.children) {
        data.children.forEach(function(item) {
          that.attachRel(item, '1' + (data.children.length > 1 ? 1 : 0));
        });
      }
      return data;
    },

    // Find and return relative nodes
    getRelatedNodes: function ($node, relation) {
      if (!$node || !($node instanceof $) || !$node.is('.node')) {
        return $();
      }
      if (relation === 'parent') {
        return $node.closest('.nodes').parent().children(':first').find('.node');
      } else if (relation === 'children') {
        return $node.closest('.row').siblings('.nodes').children().find('.node:first');
      } else if (relation == 'descendants') {
        return $node.closest('.row').siblings('.nodes').children().find('.node');
      } else if (relation === 'siblings') {
        return $node.closest('.fam').parent().siblings().find('.node:first');
      } else {
        return $();
      }
    },

    // Return whether an element is currently visible
    isVisible: function (index, elem) {
      return !$(elem).is('.slide-up');
    },

    // Hide the descendant nodes of the specified node
    hideChildren: function ($node) {
      $node.closest('.fam').children().slice(2).find('.node, .leftLine, .rightLine, .bottomLine').addClass('slide-up');
      $node.closest('.fam').children().slice(2).find('.node').addClass('squeeze');
    },

    // Show the children nodes of the specified node
    showChildren: function ($node) {
      $node.closest('.fam').children().slice(2).find('.node, .leftLine, .rightLine, .bottomLine').removeClass('slide-up');
      $node.closest('.fam').children().slice(2).find('.node').removeClass('squeeze');
    },

    // Either hides or shows children
    nodeClickHandler: function (event) {
      // event.stopPropagation();
      var $node = $(event.delegateTarget);
      if ($node.is('.slide-up')) {
        return;
      }
      var children = this.getRelatedNodes($node, 'children');
      if (children.length > 0) {
        if (this.isVisible(0, children[0])) {
          this.hideChildren($node);
        } else {
          this.showChildren($node);
        }
      }
    },

    // Create node
    createNode: function (data) {
      var that = this;
      var opts = this.options;
      var level = data.level;
      if (data.children && data[opts.nodeId]) {
        $.each(data.children, function (index, child) {
          child.parentId = data[opts.nodeId]
        });
      }
      // construct the content of node
      var $nodeDiv = $('<div' + (data[opts.nodeId] ? ' id="' + data[opts.nodeId] + '"' : '') + (data.parentId ? ' data-parent="' + data.parentId + '"' : '') + '>')
        .addClass('node ' +  (level > opts.visibleLevel ? ' slide-up' : ''));

      // title = name + parent icon (if applicable)
      var $title = $('<div class="title"/>');
      var flags = data.relationship || '';
      if (Number(flags.substr(2,1))) {
        // Add a signifier to show that a person has little(s) (so they can be expanded)
        $title.append($('<i class="oci '+ opts.parentNodeSymbol + ' symbol"></i>'));
      }
      $title.append($('<div class="name">' + data[opts.nodeTitle] + '</div>'));

      var $content = $('<div class="content">' + data[opts.nodeContent] + '</div>');

      $nodeDiv.append($title).append($content);

      // store data in html data attribute
      var nodeData = $.extend({}, data);
      delete nodeData.children;
      $nodeDiv.data('nodeData', nodeData);

      // Register node's onClick listener
      $nodeDiv.on('click', this.nodeClickHandler.bind(this));

      return $nodeDiv;
    },

    // Recursively build the tree
    buildHierarchy: function ($appendTo, data, siblingIndex, numSiblings) {
      var that = this;
      var opts = this.options;
      var level = 0;
      if (data.level) {
        level = data.level;
      } else {
        level = data.level = $appendTo.parentsUntil('.orgchart', '.nodes').length + 1;
      }
      var childrenData = data.children;

      // Wrapper
      var $nodeWrapper = $('<div class="fam">');

      // Parent Lines
      var $parentLines = $('<div class="row lines"/>');
      if (siblingIndex == 0) {
        $parentLines.append('<div class="rightLine"/>');
      } else {
        $parentLines.append('<div class="rightLine topLine"/>');
      }
      if (siblingIndex == numSiblings - 1) {
        $parentLines.append('<div class="leftLine"/>');
      } else {
        $parentLines.append('<div class="leftLine topLine"/>');
      }
      $nodeWrapper.append($parentLines);

      // The node
      var $nodeDiv = this.createNode(data);
      $nodeWrapper.append($('<div class="row"/>').append($nodeDiv));

      if (childrenData.length > 0) {
        // Child Lines
        var $childLines = $('<div class="row lines"><div class="rightLine"/><div class="leftLine"/></div>');
        $nodeWrapper.append($childLines);
        // Child Nodes
        var $nodes = $('<div class="row nodes">');
        $nodeWrapper.append($nodes);
        $.each(childrenData, function (index) {
          this.level = level + 1;
          that.buildHierarchy($nodes, this, index, childrenData.length);
        });
      }
      $appendTo.append($nodeWrapper);
    },
    //
    exportPDF: function(canvas, exportFilename){
      var doc = {};
      var docWidth = Math.floor(canvas.width);
      var docHeight = Math.floor(canvas.height);

      if (docWidth > docHeight) {
        doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [docWidth, docHeight]
        });
      } else {
        doc = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [docHeight, docWidth]
        });
      }
      doc.addImage(canvas.toDataURL(), 'png', 0, 0);
      doc.save(exportFilename + '.pdf');
    },
    //
    exportPNG: function(canvas, exportFilename){
      var that = this;
      var isWebkit = 'WebkitAppearance' in document.documentElement.style;
      var isFf = !!window.sidebar;
      var isEdge = navigator.appName === 'Microsoft Internet Explorer' || (navigator.appName === "Netscape" && navigator.appVersion.indexOf('Edge') > -1);
      var $chartContainer = this.$chartContainer;

      if ((!isWebkit && !isFf) || isEdge) {
        window.navigator.msSaveBlob(canvas.msToBlob(), exportFilename + '.png');
      } else {
        var selector = '.oci-download-btn' + (that.options.chartClass !== '' ? '.' + that.options.chartClass : '');

        if (!$chartContainer.find(selector).length) {
          $chartContainer.append('<a class="oci-download-btn' + (that.options.chartClass !== '' ? ' ' + that.options.chartClass : '') + '"'
                                 + ' download="' + exportFilename + '.png"></a>');
        }

        $chartContainer.find(selector).attr('href', canvas.toDataURL())[0].click();
      }
    },
    //
    export: function (exportFilename, exportFileextension) {
      var that = this;
      exportFilename = (typeof exportFilename !== 'undefined') ?  exportFilename : this.options.exportFilename;
      exportFileextension = (typeof exportFileextension !== 'undefined') ?  exportFileextension : this.options.exportFileextension;
      var $chartContainer = this.$chartContainer;
      var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".slide-up")').get(0);
      html2canvas(sourceChart, {
        'width': sourceChart.clientWidth,
        'height': sourceChart.clientHeight,
        'onclone': function (cloneDoc) {
          $(cloneDoc).find('.canvasContainer').css('overflow', 'visible')
            .find('.orgchart:not(".slide-up"):first').css('transform', '');
        }
      })
      .then(function (canvas) {
        if (exportFileextension.toLowerCase() === 'pdf') {
          that.exportPDF(canvas, exportFilename);
        } else {
          that.exportPNG(canvas, exportFilename);
        }

      });
    }
  };

  $.fn.orgchart = function (opts) {
    return new OrgChart(this, opts).init();
  };

}));
