module.exports = function(RED) {
  function nordpool_api(config) {
      RED.nodes.createNode(this,config);

// Config instillinger for noden:

      this.area = config.area;
      this.currency = config.currency;
      this.date = config.date
      this.timeSpan = config.timeSpan
      var node = this;


//Statuslampe fpr noden:

      this.status({ fill: 'green', shape: 'dot', text: 'Ready' });

//Nødvendige noder:

      var request = require('request')
      var moment = require("moment")

// Når det kommer en input på noden:
      
      node.on('input', function(msg) {
        this.status({ fill: 'yellow', shape: 'dot', text: 'Getting prices' });

// Variabler:

        var AREA = node.area  || 'Oslo'
        var CURRENCY = node.currency  || 'NOK' // can also be 'DKK', 'EUR', 'SEK'
        var priser = []
        var date = moment()
        var comparetime = moment("15:00:00","hh:mm:ss") //timestamt to check if the time is before or after 15:00
        var url = String
        var date1 = moment().format("DD-MM-YYYY")
        var loops = 24 //default value, hours in one day
        var timeSpan = node.timeSpan || "daily" // '10' equals hourly in response from nordpool url
        var msg = {
          payload: {},
          topic: this.timeSpan
          }

// Switch som setter riktig "columnindex" som senere benyttes for å hente priser for valgt område i config. 

        switch(AREA){

          case "SE1":
            var columnindex = 0
            timeSpan = 29
            break;
        
          case "SE2":
            var columnindex = 1
            timeSpan = 29
            break;
        
          case "SE3":
            var columnindex = 2
            timeSpan = 29
            break;  
        
          case "SE4":
           var columnindex = 3
           timeSpan = 29
           break; 
        
          case "FI":
            var columnindex = 0
            timeSpan = 35
             break;
        
          case "DK1":
            var columnindex = 0
            timeSpan = 41
            break;   
            
          case "DK2":
            var columnindex = 1
            timeSpan = 41
             break;
        
          case "Oslo":
            var columnindex = 0
            timeSpan = 23
            break;
        
          case "Kr.sand":
            var columnindex = 1
            timeSpan = 23
            break;  
          
          case "Bergen":
            var columnindex = 2
            timeSpan = 23
            break; 
        
          case "Molde":
            var columnindex = 3
            timeSpan = 23
            break;
        
          case "Tr.heim":
            var columnindex = 4
            timeSpan = 23
            break;
        
          case "Tromsø":
            var columnindex = 5
            timeSpan = 23
            break
        
          /* Following is not ready
          
          case "EE":
            var columnindex = 14
            break;
            
          case "LV":
            var columnindex = 15
            break;
        
          case "LT":
            var columnindex = 16
            timeSpan = 53
            break;
          
          case "AT":
            var columnindex = 17
            break;
          
          case "BE":
            var columnindex = 18
            break;

          case "DE-LU":
            var columnindex = 19
            break;

          case "FR":
            var columnindex = 20
            break;
          
          case "NL":
            var columnindex = 21
            break;  
            
            */        
          };

          // funksjon som oppdaterer URL slik at priser blir hentet med riktig valuta (CURRENCY) og riktig dato:

        function updateUrl(date){
          switch(node.timeSpan){
          
            case "hourly":
              timeSpan = timeSpan 
              break;
  
            case "daily":
              timeSpan = timeSpan + 1
              loops = 31
              break;
  
            case "weekly":
              timeSpan = timeSpan + 2
              loops = 24
              break;
  
            case "monthly":
              timeSpan = timeSpan + 3
              loops = 53
            }

          url = `https://www.nordpoolgroup.com/api/marketdata/page/${timeSpan}?currency=,`  
          + CURRENCY 
          + "&endDate=" + date;
          }
        updateUrl(date1)

// Promise funksjon som henter priser fra NordPool
      
        var promise1 = new Promise((resolve, reject) => {  
          request(url, {json: true}, function (error, response,body) { 
          if (error !== null) {
               reject(error); 
               return
           }
          if (typeof body.data === "undefined"){
             reject(`Error: Prices not available when requesting ${url}`); 
             return
            }
          for (var i=0; i < loops; i++){
            let values = {
              Area: body.data.Rows[i].Columns[columnindex].Name, 
              Timestamp: moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm"), 
              StartTime: moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm"), 
              EndTime: moment(body.data.Rows[i].EndTime).format( "YYYY-MM-DD HH:mm"), 
              SortTime: new Date(moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm")), 
              Price: parseFloat(body.data.Rows[i].Columns[columnindex].Value.replace(" ", "").replace(",", ".")), 
              Valuta: body.data.Units[0] 
              }
            priser.push(values)
            resolve(values)
            }
          })
        });

// Dersom klokken er over 15:00 som er definert i variabel "comparetime" så hentes priser for neste døgn. 
// Dersom klokken er før 15:00 hentes ikke priser for neste døgn da det er risiko for at disse ikke er publisert enda. 

        if (date > comparetime & node.timeSpan == "hourly") {
          date = moment().add(1,"day").format("DD-MM-YYYY")
          updateUrl(date)
          var promise2 = new Promise((resolve, reject) => {  
            request(url, {json: true}, function (error, response,body) { 
              if (error !== null) {
                reject(error); 
                return
                }
              if (typeof body.data === "undefined"){
                reject(`Error: Prices not available when requesting ${url}`); 
                return
                }
              for (var i=0; i < loops; i++){
                let values = {
                  Area: body.data.Rows[i].Columns[columnindex].Name,
                  Timestamp: moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm"),
                  StartTime: moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm"),
                  EndTime: moment(body.data.Rows[i].EndTime).format( "YYYY-MM-DD HH:mm"),
                  SortTime: new Date(moment(body.data.Rows[i].StartTime).format( "YYYY-MM-DD HH:mm")),
                  Price: parseFloat(body.data.Rows[i].Columns[columnindex].Value.replace(" ", "").replace(",", ".")),
                  Valuta: body.data.Units[0]
                }
              priser.push(values)
              resolve(values)
              }
            });
          });
        }


// sortering av priser etter dato i tilfelle prisern for neste døgn kommer inn før dette døgn.
// Sender dereter priser ut av noden. 
            Promise.all([promise1, promise2])
            .then(function() {
              var sortpris = priser.sort((a, b) => a.SortTime - b.SortTime)
              for( var i = 0; i < priser.length; i++){
                delete priser[i].SortTime
                }
              msg.payload = priser
              node.send(msg)
              node.status({ fill: 'green', shape: 'dot', text: 'Ready' });  
              })
            .catch(function(reject) {
              function status1(){
                node.status({ fill: 'green', shape: 'dot', text: 'ready' })
                }
              node.status({ fill: 'blue', shape: 'dot', text: 'error' }),
              node.send(reject)
              setTimeout(status1
              ,2000)
              });   
      });
     }
     RED.nodes.registerType("nordpool-api",nordpool_api);
    }
