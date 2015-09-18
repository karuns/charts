Ext.define('Rally.example.CFDCalculator', {
    extend: 'Rally.data.lookback.calculator.TimeSeriesCalculator',
    config: {
        stateFieldName: 'ScheduleState',
        stateFieldValues: ['Defined', 'In-Progress', 'Completed', 'Accepted']
    },

    constructor: function(config) {
        this.initConfig(config);
        this.callParent(arguments);
    },

    getMetrics: function() {
        return _.map(this.getStateFieldValues(), function(stateFieldValue) {
            return  {
                as: stateFieldValue,
                groupByField: this.getStateFieldName(),
                allowedValues: [stateFieldValue],
                f: 'groupByCount',
                display: 'area'
            };
        }, this);
    }
});

