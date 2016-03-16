/**
 * @author taehwa.kim
 * extensions: https://github.com/wenzhixin/bootstrap-table
 */

!function ($) {

    'use strict';

    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    $.extend($.fn.bootstrapTable.defaults, {
        showStatusFiltertButton: false,
        showAdvancedSearch: false,
        showExportButton: false,
        defaultExportUrl : "",
        showStatusFilterButtonList : [],
        showTableInfo : false,
    });


    var BootstrapTable = $.fn.bootstrapTable.Constructor,   
        _initToolbar = BootstrapTable.prototype.initToolbar;

    

    var locales = {
        'en-US' : {
            formatLoadingMessage: function () {
                return 'Loading, please wait...';
            },
            
            formatNoMatches: function () {
                return 'There is no Dac to validate';
            },
            
            formatshowStatusFiltertButton: function () {
                return 'Filter status';
            },
            formatshowAdvancedSearch: function () {
                return 'Advanced Search';
            },
            formatshowExportButton: function () {
                return 'Export to excel';
            }
        }

    };

    $.extend($.fn.bootstrapTable.defaults, locales['en-US']);

    

    BootstrapTable.prototype.initToolbar = function () {
        var that = this,
            html = [],
            timeoutId = 0,
            $keepOpen,
            $search,
            switchableCount = 0;

        this.$toolbar.html('');

        if (typeof this.options.toolbar === 'string' || typeof this.options.toolbar === 'object') {
            $(sprintf('<div class="bars pull-%s"></div>', this.options.toolbarAlign))
                .appendTo(this.$toolbar)
                .append($(this.options.toolbar));
        }

        // showColumns, showToggle, showRefresh
        html = [sprintf('<div class="columns columns-%s btn-group pull-%s">',
            this.options.buttonsAlign, this.options.buttonsAlign)];

        if (typeof this.options.icons === 'string') {
            this.options.icons = calculateObjectValue(null, this.options.icons);
        }

        if (this.options.showPaginationSwitch) {
            html.push(sprintf('<button class="btn btn-default" type="button" name="paginationSwitch" title="%s">',
                    this.options.formatPaginationSwitch()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.paginationSwitchDown),
                '</button>');
        }

        if (this.options.showRefresh) {
            html.push(sprintf('<button class="btn btn-default' + (this.options.iconSize === undefined ? '' : ' btn-' + this.options.iconSize) + '" type="button" name="refresh" title="%s">',
                    this.options.formatRefresh()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.refresh),
                '</button>');
        }

        if (this.options.showToggle) {
            html.push(sprintf('<button class="btn btn-default' + (this.options.iconSize === undefined ? '' : ' btn-' + this.options.iconSize) + '" type="button" name="toggle" title="%s">',
                    this.options.formatToggle()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.toggle),
                '</button>');
        }

        if (this.options.showColumns) {
            html.push(sprintf('<div class="keep-open btn-group" title="%s">',
                    this.options.formatColumns()),
                '<button type="button" class="btn btn-default' + (this.options.iconSize == undefined ? '' : ' btn-' + this.options.iconSize) + ' dropdown-toggle" data-toggle="dropdown">',
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.columns),
                ' <span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu" role="menu">');

            $.each(this.columns, function (i, column) {
                if (column.radio || column.checkbox) {
                    return;
                }

                if (that.options.cardView && (!column.cardVisible)) {
                    return;
                }

                var checked = column.visible ? ' checked="checked"' : '';

                if (column.switchable) {
                    html.push(sprintf('<li>' +
                        '<label><input type="checkbox" data-field="%s" value="%s"%s> %s</label>' +
                        '</li>', column.field, i, checked, column.title));
                    switchableCount++;
                }
            });
            html.push('</ul>',
                '</div>');
        }

        /* Stauts filter
        ========================================================================== */
        if (this.options.showStatusFiltertButton) {
            
            var statusList = this.options.showStatusFilterButtonList;

            html.push(sprintf('<div class="keep-open btn-group status-filter" title="%s">',
                    this.options.formatshowStatusFiltertButton()),
                '<button type="button" class="btn btn-default' + (this.options.iconSize == undefined ? '' : ' btn-' + this.options.iconSize) + ' dropdown-toggle" data-toggle="dropdown">',
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.statusFilter),
                ' <span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu" role="menu">');

            $.each(statusList, function (i, column) {

                if (that.options.cardView && (!column.cardVisible)) {
                    return;
                }

                var checked = column.isChecked ? ' checked="checked"' : '';

                html.push(sprintf('<li>' +
                '<label><input type="checkbox" class="status-filter-check-box" data-type="%s"  %s> %s</label>' +
                '</li>', column.type, checked, column.name));

            });

            html.push('</ul>',
                '</div>');
        }

        /* Advanced search link
        ========================================================================== */
        if (this.options.showAdvancedSearch) {
            html.push(sprintf('<a href="/invdac/search/" class="btn btn-default" type="button" name="showAdvancedSearch" id="showAdvancedSearch" title="%s">',
                    this.options.formatshowAdvancedSearch()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.showAdvancedSearch),
                '</a>');
        }

        /* Export excel file
        ========================================================================== */        
        if (this.options.showExportButton) {
            html.push(sprintf('<a class="btn btn-default" href="%s" name="showExportButton" id="showExportButton" title="%s">',
                    this.options.defaultExportUrl,this.options.formatshowExportButton()),
                sprintf('<i class="%s %s"></i>', this.options.iconsPrefix, this.options.icons.showExportButton),
                '</a>');
        }

        html.push('</div>');

        // Fix #188: this.showToolbar is for extentions
        if (this.showToolbar || html.length > 2) {
            this.$toolbar.append(html.join(''));
        }

        if (this.options.showPaginationSwitch) {
            this.$toolbar.find('button[name="paginationSwitch"]')
                .off('click').on('click', $.proxy(this.togglePagination, this));
        }

        if (this.options.showRefresh) {
            this.$toolbar.find('button[name="refresh"]')
                .off('click').on('click', $.proxy(this.refresh, this));
        }

        if (this.options.showToggle) {
            this.$toolbar.find('button[name="toggle"]')
                .off('click').on('click', function () {
                    that.toggleView();
                });
        }

        if (this.options.showColumns) {
            $keepOpen = this.$toolbar.find('.keep-open');

            if (switchableCount <= this.options.minimumCountColumns) {
                $keepOpen.find('input').prop('disabled', true);
            }

            $keepOpen.find('li').off('click').on('click', function (event) {
                event.stopImmediatePropagation();
            });
            $keepOpen.find('input').off('click').on('click', function () {
                var $this = $(this);

                that.toggleColumn(getFieldIndex(that.columns,
                    $(this).data('field')), $this.prop('checked'), false);
                that.trigger('column-switch', $(this).data('field'), $this.prop('checked'));
            });
        }

        if (this.options.search) {
            html = [];
            html.push(
                '<div class="pull-' + this.options.searchAlign + ' search">',
                sprintf('<input class="form-control' + (this.options.iconSize === undefined ? '' : ' input-' + this.options.iconSize) + '" type="text" placeholder="%s">',
                    this.options.formatSearch()),
                '</div>');

            this.$toolbar.append(html.join(''));
            $search = this.$toolbar.find('.search input');
            $search.off('keyup drop').on('keyup drop', function (event) {
                clearTimeout(timeoutId); // doesn't matter if it's 0
                timeoutId = setTimeout(function () {
                    that.onSearch(event);
                }, that.options.searchTimeOut);
            });
        }

        /* Add Table info area
        ========================================================================== */
        if (this.options.showTableInfo) {
            html = [];
            html.push(sprintf('<div class="table-info alert alert-danger pull-left">%s</div>', this.options.TableInfoMessage));

            this.$toolbar.append(html.join(''));
        }
    };
   

}(jQuery);
