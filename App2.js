
Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css
    requires: ['Rally.example.CFDCalculator'],
    // Entry Point to App
    launch: function() {
      console.log('QA rally charts');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      
      /* Creating pull down container first and adding to app */
      this.pulldownContainer  = Ext.create('Ext.container.Container', {
          layout: {
              type: 'hbox',
              align: 'stretch'
          },
          width: 400,
          border: 5,
          style: {borderColor:'#800000 ', borderStyle:'solid', borderWidth:'10px', color: 'yellow',backgroundColor:'#A8A8A8'},
      });
      
      this.add(this.pulldownContainer);
      this._loadChartList(); 
    },

    
    /* Loading list of available chart */
    _loadChartList: function () {
    	var charts = Ext.create('Ext.data.Store', {
    		 fields: ['abbr', 'name'],
    		    data : [
    		        {"abbr":"BC", "name":"Burndown Chart"},
    		        {"abbr":"DT", "name":"Defect Trend"},  
    		        {"abbr":"PB", "name":"PI Burnup"},  
    		        {"abbr":"PC", "name":"Project Cumulative Flow"},
    		        {"abbr":"82", "name":"8.2 Open Defects"},
    		        {"abbr":"81", "name":"8.1 Open Defects"},
    		        {"abbr":"P2", "name":"Project2"},
    		        {"abbr":"SR", "name":"Standard Report"},
    		    ]
    	});
    	
    	this.chartTypes = Ext.create('Ext.form.ComboBox', {
    	    fieldLabel: 'Choose Chart',
    	    store: charts,
    	    queryMode: 'local',
    	    displayField: 'name',
    	    valueField: 'abbr',
    	    renderTo: Ext.getBody(),
    	    listeners: {
            ready: function(combobox) {
            	this._loadHighChart(this.chartTypes.getValue());
            },
            select: function(combobox) {
            	this._loadHighChart(this.chartTypes.getValue());
            },
            scope: this
        }
    	});
    	this.pulldownContainer.add(this.chartTypes);	
    },
    
    
    _createChartContainer: function() {
    	/* Creating pull down container first and adding to app */
        this.chartContainer  = Ext.create('Ext.container.Container', {
        	id:'cont',
        	renderTo:Ext.getBody(),
            layout: {
                type: 'hbox',
                align: 'middle'
            },
        });
        this.add(this.chartContainer);
    },
    
    _removeChartContainer: function() {
    	if(this.chartContainer) {
    		var elem = document.getElementById("cont");
    		elem.remove();
    		//this.remove(this.chartContainer);
    	}
    	this.chartContainer = null;
    },
       
    
    /* Load High charts */
    _loadHighChart : function(chartType) {       
    	this._removeChartContainer();
    	this._createChartContainer();
    	switch(chartType) {
    		case "BC": 
    			console.log("Loading Burndown chart ");
    			this._loadBurnDownChart();
    			break;
    		case "DT":
    			console.log("Loading Defect Trend ");
    			this._loadDefectTrend();
    			break;
    		case "PB":
    			console.log("Loading PI Burnup ");
    			this._loadPiBurnup();
    			break;
       		case "PC":
    			console.log("Loading project cumulative flows ..");
    			this._loadProjectCumulative();
    			break;
       		case "82":
       			console.log("Loading 8.2 Open Defects chart");
       			this._82openDefect();
       			break;
       		case "81":
       			console.log("Loading 8.1 Open Defects chart");
       			this._81openDefect();
       			break;
       		case "P2":
       			console.log("Loading chart2");
       			this._chart2();
       			break;
       		case "SR":
       			console.log("Loading the Standard Report");
       			this._standardReport();
       			break;
    		default:
    			console.log("Loading Burndown chart ");
    	}
    },
    
    _standardReport: function() {
    	this.chartContainer.add({
    				xtype:'rallystandardreport',
                    project: Rally.util.Ref.getRelativeUri(this.getContext().getProject()),
                    projectScopeUp: this.getContext().getProjectScopeUp(),
                    projectScopeDown: this.getContext().getProjectScopeDown(),
                    width: 600,
                    height: 400,
                    reportConfig: {
                        report: Rally.ui.report.StandardReport.Reports.Throughput,
                        work_items: 'G,D',
                        filter_field: 'ScheduleState',
//                        from_state: 'Accepted',
//                        to_state: 'Accepted',
//                        DefectsByPriority: 'P1'
                    }
    	});
    },
       
    _releaseContainer: function () {
    	this.relContainer = Ext.create('Ext.Container', {
        items: [{
            xtype: 'rallyreleasecombobox',
        }],
        renderTo: Ext.getBody().dom,
	    listeners: {
            ready: this._loadReleaseChart(this.relContainer.getValue()),
           select: this._loadReleaseChart("8.1"),
            scope: this
        }
    	});
    	//console.log(this.relContainer.getValue());
    	this.chartContainer.add(this.relContainer);
    	console.log(this.relContainer.getRecord().get('Name'));
    	
    },
    
    /* Release based Charts */
    _loadReleaseChart : function(release) {    
    	console.log("Inside loadReleaseChart");
    	this._removeChartContainer();
    	this._createChartContainer();
    	switch(release) {
    		case "8.1": 
       			this._openReleaseDefect();
    			break;
    		case "8.2":
       			this._openReleaseDefect();
    			break;
    		case "8.3":
       			this._openReleaseDefect();
    			break;
    		default:
    			console.log("Loading nothing..");
    	}
    },
    
    /*
     * Load release trend
     * 
     */
    _openReleaseDefect: function() {
    	this.chart = {
                xtype: 'rallychart',
                storeType: 'Rally.data.lookback.SnapshotStore',
                storeConfig: this._getStoreForReleaseDefect(),
                calculatorType: 'Rally.example.CFDCalculator',
                calculatorConfig: {
                	  stateFieldName: 'Severity',
                      stateFieldValues: ['P1 - Crash/Data Loss, upgrade/migration fail', 
                                         'P2 - Major Problem, loss of stability or feature functionality', 
                                         'P3 - Minor Problem, improves customer experience',
                                         'P4 - Cosmetic, okay to defer'
                                         ]
                },
                width: 1000,
                height: 600,
                chartConfig: this._getopenDefectConfig()
            };
    	console.log("release printing");
    	console.log(this._getStoreConfig());
    	console.log(this._getStoreConfig().valueOf());
    	this.chartContainer.add(this.chart);
    },
    
    _getStoreForReleaseDefect: function() {
        return {
            find: {
                _TypeHierarchy: { '$in' : [ 'Defect' ] },
                Children: null,
                _ProjectHierarchy: this.getContext().getProject().ObjectID,
                _ValidFrom: {'$gt': Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), 'day', -120)) },
                State: "Open",
                //Release: "8.1",
            },
            fetch: ['Severity','Release'],
            hydrate: ['Severity','Release'],
            sort: {
                _ValidFrom: 1
            },
            context: this.getContext().getDataContext(),
            limit: Infinity
        };
    },
 
    
    /* Load Defect Trend */
    _loadDefectTrend : function() {
    	var store = Ext.create('Ext.data.JsonStore', {
    	    fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
    	    data: [
    	        { 'name': 'metric one',   'data1': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
    	        { 'name': 'metric two',   'data1': 7,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
    	        { 'name': 'metric three', 'data1': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
    	        { 'name': 'metric four',  'data1': 2,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
    	        { 'name': 'metric five',  'data1': 4,  'data2': 4,  'data3': 36, 'data4': 13, 'data5': 33 }
    	    ]
    	});
    	
    	this.chart = Ext.create('Ext.chart.Chart', {
    	    renderTo: Ext.getBody(),
    	    width: 1000,
    	    height: 600,
    	    id: 'defect-trend-chart',
    	    animate: true,
    	    store: store,
    	    axes: [
    	        {
    	            type: 'Numeric',
    	            position: 'left',
    	            fields: ['data1', 'data2','data3'],
    	            label: {
    	                renderer: Ext.util.Format.numberRenderer('0,0')
    	            },
    	            title: 'Sample Values',
    	            grid: true,
    	            minimum: 0
    	        },
    	        {
    	            type: 'Category',
    	            position: 'bottom',
    	            fields: ['name'],
    	            title: 'Sample Metriccs'
    	        }
    	    ],
    	    series: [
    	        {
    	            type: 'line',
    	            highlight: {
    	                size: 7,
    	                radius: 7,
    	            },
    	            axis: 'left',
    	            xField: 'name',
    	            yField: 'data1',
    	            markerConfig: {
    	                type: 'cross',
    	                size: 4,
    	                radius: 4,
    	                'stroke-width': 0
    	            }
    	        },
    	        {
    	            type: 'line',
    	            highlight: {
    	                size: 7,
    	                radius: 7
    	            },
    	            axis: 'left',
    	            fill: true,
    	            xField: 'name',
    	            yField: 'data2',
    	            markerConfig: {
    	                type: 'circle',
    	                size: 4,
    	                radius: 4,
    	                'stroke-width': 0
    	            }
    	        },
    	        {
    	            type: 'line',
    	            highlight: {
    	                size: 7,
    	                radius: 7
    	            },
    	            axis: 'left',
    	            fill: true,
    	            xField: 'name',
    	            yField: 'data3',
    	            markerConfig: {
    	                type: 'circle',
    	                size: 4,
    	                radius: 4,
    	                'stroke-width': 0
    	            }
    	        }
    	    ]
    	});
    	
    	this.chartContainer.add(this.chart);
    },
    
    
    /*
     * Load 8.2 open Defect trend
     * */
    _82openDefect: function() {
    	this.chart = {
                xtype: 'rallychart',
                storeType: 'Rally.data.lookback.SnapshotStore',
                storeConfig: this._82getStoreForopenDefect(),
                calculatorType: 'Rally.example.CFDCalculator',
                calculatorConfig: {
                	  stateFieldName: 'Severity',
                      stateFieldValues: ['P1 - Crash/Data Loss, upgrade/migration fail', 
                                         'P2 - Major Problem, loss of stability or feature functionality', 
                                         'P3 - Minor Problem, improves customer experience',
                                         'P4 - Cosmetic, okay to defer'
                                         ]
                },
                width: 1000,
                height: 600,
                chartConfig: this._82getopenDefectConfig()
            };
    	this.chartContainer.add(this.chart);
    },
    
    _82getStoreForopenDefect: function() {
        return {
            find: {
                _TypeHierarchy: { '$in' : [ 'Defect' ] },
                Children: null,
                _ProjectHierarchy: this.getContext().getProject().ObjectID,
                _ValidFrom: {'$gt': Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), 'day', -120)) },
                State: "Open",
                Release: 19388025787,
            },
            fetch: ['Severity','Release','Project'],
            hydrate: ['Severity','Release','Project'],
            sort: {
                _ValidFrom: 1
            },
            context: this.getContext().getDataContext(),
            limit: Infinity
        };
    },
    
    _82getopenDefectConfig: function() {
    	console.log("starting 8.2 open defect chart");
        return {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: '8.2 Open Defects'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                tickInterval: 20,
                title: {
                    text: 'Date'
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Count'
                    }
                }
            ],
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal'
                }
            }
        };
    },
    
    
    /*
     * Load 8.1 openDefect trend
     * */
    _81openDefect: function() {
    	this.chart = {
                xtype: 'rallychart',
                storeType: 'Rally.data.lookback.SnapshotStore',
                storeConfig: this._81getStoreForopenDefect(),
                calculatorType: 'Rally.example.CFDCalculator',
                calculatorConfig: {
                	  stateFieldName: 'Severity',
                      stateFieldValues: ['P1 - Crash/Data Loss, upgrade/migration fail', 
                                         'P2 - Major Problem, loss of stability or feature functionality', 
                                         'P3 - Minor Problem, improves customer experience',
                                         'P4 - Cosmetic, okay to defer'
                                         ]
                },
                width: 1000,
                height: 600,
                chartConfig: this._81getopenDefectConfig()
            };
    	this.chartContainer.add(this.chart);
    },
    
    _81getStoreForopenDefect: function() {
        return {
            find: {
                _TypeHierarchy: { '$in' : [ 'Defect' ] },
                Children: null,
                _ProjectHierarchy: this.getContext().getProject().ObjectID,
                _ValidFrom: {'$gt': Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), 'day', -120)) },
                State: "Open",
                Release: 18206829517,
            },
            fetch: ['Severity','Release','Project'],
            hydrate: ['Severity','Release','Project'],
            sort: {
                _ValidFrom: 1
            },
            context: this.getContext().getDataContext(),
            limit: Infinity
        };
    },
    
    _81getopenDefectConfig: function() {
    	console.log("starting 8.1 open defect chart");
        return {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: '8.1 Open Defects'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                tickInterval: 20,
                title: {
                    text: 'Date'
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Count'
                    }
                }
            ],
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal'
                }
            }
        };
    },
    
    /*
     * Load chart2 trend
     * */
    _chart2: function() {
    	var projectName = this.getContext().getProject()._refObjectName;
    	var projectName1 = this.getContext();
    	console.log("========");
    	console.log(projectName);
    	console.log(this.getContext().getProject());
    	console.log(projectName1);
    	this.chart = {
                xtype: 'rallychart',
                storeType: 'Rally.data.lookback.SnapshotStore',
                storeConfig: this._getStoreForChart2(),
                calculatorType: 'Rally.example.CFDCalculator',
                calculatorConfig: {
              	  stateFieldName: this.getContext().getProject(),
                  stateFieldValues: ['BE','FE']                	
                },
                width: 1000,
                height: 600,
                chartConfig: this._getChart2Config()
            };
    	this.chartContainer.add(this.chart);
    },
    
    
    
    _getStoreForChart2: function() {        
        var obj1 = {
            find: {
                _TypeHierarchy: { '$in' : [ 'Defect' ] },
                Children: null,
                _ProjectHierarchy: this.getContext().getProject().ObjectID,
                _ValidFrom: {'$gt': Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), 'day', -120)) },
                State: "Open",
            },
            fetch: ['Project'],
            hydrate: ['Project'],
            sort: {
                _ValidFrom: 1
            },
            context: this.getContext().getDataContext(),
            limit: Infinity,
            val: this.Name,
        };
        return obj1;
    },
    
    _getChart2Config: function() {
    	console.log("starting chart config");
        return {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Chart2'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                tickInterval: 20,
                title: {
                    text: 'Date'
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Count'
                    }
                }
            ],
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal'
                }
            }
        };
    },
    
    
    /* Load Project Cumulative Flow */
    _loadProjectCumulative : function() {	
    	this.chart = {
                xtype: 'rallychart',
                storeType: 'Rally.data.lookback.SnapshotStore',
                storeConfig: this._getStoreConfig(),
                calculatorType: 'Rally.example.CFDCalculator',
                calculatorConfig: {
                    stateFieldName: 'ScheduleState',
                    stateFieldValues: ['Defined', 'In-Progress', 'Completed', 'Accepted']
                },
                width: 1000,
                height: 600,
                chartConfig: this._getChartConfig()
            };
    	console.log("Printing");
    	console.log(this._getStoreConfig());
    	console.log(this._getStoreConfig().valueOf());
    	this.chartContainer.add(this.chart);
    },
    
    
	    /**
	     * Generate the store config to retrieve all snapshots for stories and defects in the current project scope
	     * within the last 30 days
	     */
	    _getStoreConfig: function() {
	        return {
	            find: {
	                _TypeHierarchy: { '$in' : [ 'Defect' ] },
	                Children: null,
	                _ProjectHierarchy: this.getContext().getProject().ObjectID,
	                _ValidFrom: {'$gt': Rally.util.DateTime.toIsoString(Rally.util.DateTime.add(new Date(), 'day', -120)) },
	            },
	            fetch: ['ScheduleState'],
	            hydrate: ['ScheduleState'], 
	            sort: {
	                _ValidFrom: 1
	            },
	            context: this.getContext().getDataContext(),
	            limit: Infinity
	        };
	    },
	
	    
	    /**
	     * Generate a valid Highcharts configuration object to specify the chart
	     */
	    _getChartConfig: function() {
	        return {
	            chart: {
	                zoomType: 'xy'
	            },
	            title: {
	                text: 'Project Cumulative Flow'
	            },
	            xAxis: {
	                tickmarkPlacement: 'on',
	                tickInterval: 20,
	                title: {
	                    text: 'Date'
	                }
	            },
	            yAxis: [
	                {
	                    title: {
	                        text: 'Count'
	                    }
	                }
	            ],
	            plotOptions: {
	                series: {
	                    marker: {
	                        enabled: false
	                    }
	                },
	                area: {
	                    stacking: 'normal'
	                }
	            }
	        };
	    }
 

});


