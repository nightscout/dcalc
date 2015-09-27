
// CONSTANTS
var ONE_HOUR = 3600000,
    ONE_MINUTE = 60000,
    FIVE_MINUTES = 300000,
    FORTY_MINUTES = 2400000,
    TWO_DAYS = 172800000
;
function get_timestamp_date (el) {
  if (el.timestamp) {
    return new Date(Date.parse(el.timestamp));
  }
}

function get_date_date (el) {
  if (el.date) {
    return new Date(el.date * 1000);
  }
}

function get_date (el) {
  return el.timestamp ? get_timestamp_date(el) : get_date_date(el);
}

function predictor (opts) {
  
  var state = {
    BG_REF: 140
  , BG_MIN: 36
  , BG_MAX: 400
  , AR: [-0.723, 1.716]
  , count: 6
  , offset: FIVE_MINUTES
  , date: get_date
  };

  function my (data) {
    var predicted = [ ];
    var y = data.slice(-2).map(scale);
    var count = state.count;
    var last = state.date(data.slice(-1)[0]).getTime( );
    var sgv;
    for (var i = 0; i < count; i++) {
      y = [y[1], state.AR[0] * y[0] * state.AR[1] * y[1]];
      last = last + state.offset;
      sgv = Math.max(state.BG_MIN,
              Math.min(state.BG_MAX,
                Math.round(state.BG_REF * Math.exp(y[1]))));
      predicted.push({ date: last, timestamp: new Date(last).toISOString( ), sgv: sgv });
    }
    return predicted;
  }

  function scale (el) {
    return Math.log(el.sgv / my.ref( ));
  }

  my.date = function (_) {
    if (_) {
      state.date = _;
      return my;
    }
    return state.date;
  };

  my.ref = function ref (_) {
    if (_) {
      state.BG_REF = _;
      return my;
    }
    return state.BG_REF;
  };

  my.min = function min (_) {
    if (_) {
      state.BG_MIN = _;
      return my;
    }
    return state.BG_MIN;
  };

  my.max = function max (_) {
    if (_) {
      state.BG_MAX = _;
      return my;
    }
    return state.BG_MAX;
  };

  my.AR = function AR (_) {
    if (_) {
      state.AR = _;
      return my;
    }
    return state.AR;
  }

  return my;
}
module.exports = predictor;

if (!module.parent) {
function fmt_tsv (rec) {
  return [rec.timestamp, rec.sgv].join('\t');
}

var data = [
  {'sgv': 136, timestamp: '2014-07-24T16:35:13-0700' }
, {'sgv': 150, timestamp: '2014-07-24T16:40:13-0700' }
, {'sgv': 75, timestamp: '2014-07-24T16:45:13-0700' }
, {'sgv': 57, timestamp: '2014-07-24T16:50:13-0700' }
];
var da = [
  {'sgv': 75, timestamp: '2014-07-24T16:45:13-0700' }
, {'sgv': 75, timestamp: '2014-07-24T16:45:13-0700' }
];
var db = [
  {'sgv': 88, timestamp: '2014-07-24T16:45:13-0700' }
, {'sgv': 88, timestamp: '2014-07-24T16:45:13-0700' }
];
var predict = predictor( );
console.log("### data");
console.log('```');
console.log(data.map(fmt_tsv).join('\n'));
console.log('```');
console.log("## REF", 140);
console.log('```');
console.log(predict.ref(140)(data).map(fmt_tsv).join('\n'));
console.log('```');
console.log("## REF", 150);
console.log('```');
console.log(predict.ref(150)(data).map(fmt_tsv).join('\n'));
console.log('```');
console.log("## DA");
console.log('```');
console.log(da.map(fmt_tsv).join('\n'));
console.log('prediction');
console.log(predict.ref(140)(da).map(fmt_tsv).join('\n'));
console.log('```');
console.log("## DB");
console.log('```');
console.log(db.map(fmt_tsv).join('\n'));
console.log('prediction');
console.log(predict.ref(140)(db).map(fmt_tsv).join('\n'));
console.log('```');

}
