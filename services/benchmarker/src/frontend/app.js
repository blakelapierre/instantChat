var Rickshaw = require('rickshaw'),
    _ = require('lodash');


document.addEventListener('DOMContentLoaded', function() {
console.log('started');

  var socket = io(window.location.protocol + '//' + window.location.host);

  var graph, xAxis, yAxis, legend, shelving, highlighter;

  var baseTime = 9999999999999999;

  var render = function(machines) {
    console.log(graphData);
    graph.update();
  };

  var throttledRender = _.throttle(render, 200);

  socket.on('machines', function(data) {
    _.each(data, function(machine) {
      var storedMachine = storeMachine(machine);

      _.each(storedMachine.stats, function(value, name) {
        var timestamp = Date.parse(value);

        if (isNaN(timestamp)) {
          delete storedMachine.stats[name];
          console.log('Invalid date', storedMachine, name, value);
        }
        else {
          var date = new Date(timestamp);
          machine.stats[name] = date;
        }
      });
    });

    _.each(machines, function(machine) {
      _.each(machine.stats, function(date, stat) {
        var time = date.getTime();
        if (time < baseTime) baseTime = time;
      });
    });

    var newData = [];
    _.each(data, function(machine) {
      _.each(machine.stats, function(date, stat) {
        var point = {x: machines[machine.name].x, y: (date.getTime() - baseTime) / 1000};
        addPoint(stat, point);
        console.log(point);
      });
    });

    var onSeries = allSeries['on'];

    if (onSeries) {
      onSeries.data.sort(function(pointA, pointB) { return pointA.y - pointB.y; });

      var mapping =[];
      _.each(onSeries.data, function(point, index) {
        mapping[point.x] = index;
      });

      console.log('mapping', mapping);
      _.each(graphData, function(series) {
        console.log(series.data);
        _.each(series.data, function(point, index) {
          console.log(point, mapping[point.x]);
          point.x = mapping[point.x];
        });
        series.data.sort(function(pointA, pointB) { console.log(pointA); return pointA.x - pointB.x; });
      });
    }

    console.log('graphdata', graphData);


    if (!graph) {
      graph = new Rickshaw.Graph({
        element: document.querySelector('#chart'),
        renderer: 'scatterplot',
        stroke: true,
        series: graphData
      });

      legend = new Rickshaw.Graph.Legend({
        graph: graph,
        element: document.querySelector('#legend')
      });

      shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
        graph: graph,
        legend: legend
      });

      highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
        graph: graph,
        legend: legend
      });

      xAxis = new Rickshaw.Graph.Axis.X({
        graph: graph
      });

      yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph
      });

      graph.render();
    }
    else {
      //graph.render();
    }



    throttledRender(machines);
  });

  document.getElementById('exportData').onclick = function exportData() {
    console.log(machines);
    alert('check console!');
  };
});

function getMachines() {
  return {"4d72cc64-e68d-476f-9ff7-b2cca6341d3f":{"cadvisorPull":"2014-10-03T23:08:24,804141846+0000","on":"2014-10-03T23:07:41,000000000+0000","joindate":"2014-10-03T23:08:06,619314465+0000","broadcasterPull":"2014-10-03T23:08:11,050618053+0000","cadvisorPulled":"2014-10-03T23:08:26,583699710+0000","broadcasterPulled":"2014-10-03T23:09:12,986914517+0000"},"a6601962-d228-4600-975e-b921d51f453a":{"broadcasterPull":"2014-10-03T23:08:16,851412532+0000","cadvisorPull":"2014-10-03T23:08:40,268145005+0000","on":"2014-10-03T23:07:56,000000000+0000","joindate":"2014-10-03T23:08:14,190739140+0000","cadvisorPulled":"2014-10-03T23:08:41,817656448+0000","broadcasterPulled":"2014-10-03T23:09:32,792880257+0000"},"0d853dd3-b9f4-45c0-81ec-69f0f9f0138b":{"on":"2014-10-03T23:08:10,000000000+0000","joindate":"2014-10-03T23:08:27,410866180+0000","cadvisorPull":"2014-10-03T23:08:45,132934558+0000","broadcasterPull":"2014-10-03T23:08:32,672934842+0000","cadvisorPulled":"2014-10-03T23:08:46,939966344+0000","broadcasterPulled":"2014-10-03T23:09:24,407311704+0000"},"9d5a62a4-a6bb-47ed-a338-86202c4602ee":{"broadcasterPull":"2014-10-03T23:08:11,648181724+0000","cadvisorPull":"2014-10-03T23:08:30,629579750+0000","on":"2014-10-03T23:07:39,000000000+0000","joindate":"2014-10-03T23:08:04,038992438+0000","cadvisorPulled":"2014-10-03T23:08:32,295684163+0000","broadcasterPulled":"2014-10-03T23:09:33,632743864+0000"},"9a276cc9-5ea9-47be-876d-062723296063":{"cadvisorPull":"2014-10-03T23:08:32,563795249+0000","on":"2014-10-03T23:07:40,000000000+0000","joindate":"2014-10-03T23:08:05,227517729+0000","broadcasterPull":"2014-10-03T23:08:05,597600891+0000","cadvisorPulled":"2014-10-03T23:08:34,249018470+0000","broadcasterPulled":"2014-10-03T23:09:43,879614166+0000"},"0e1cd040-42dc-4fb3-a69a-c203051588db":{"cadvisorPull":"2014-10-03T23:08:34,293324723+0000","on":"2014-10-03T23:07:58,000000000+0000","joindate":"2014-10-03T23:08:17,167352777+0000","broadcasterPull":"2014-10-03T23:08:19,054487310+0000","cadvisorPulled":"2014-10-03T23:08:36,144728738+0000","broadcasterPulled":"2014-10-03T23:09:18,015795276+0000"},"cb04d37b-f9e9-4f3b-939d-f9f0ab0736c1":{"cadvisorPull":"2014-10-03T23:08:43,641853124+0000","on":"2014-10-03T23:07:46,000000000+0000","joindate":"2014-10-03T23:08:23,169364971+0000","broadcasterPull":"2014-10-03T23:08:27,744206327+0000","cadvisorPulled":"2014-10-03T23:08:45,421954060+0000","broadcasterPulled":"2014-10-03T23:09:46,661020979+0000"},"d660ea1f-afc3-45b6-9556-6f05649e9dbe":{"cadvisorPull":"2014-10-03T23:08:41,184395486+0000","on":"2014-10-03T23:07:59,000000000+0000","joindate":"2014-10-03T23:08:24,116072104+0000","broadcasterPull":"2014-10-03T23:08:25,796063899+0000","cadvisorPulled":"2014-10-03T23:08:42,939384789+0000","broadcasterPulled":"2014-10-03T23:09:21,217827269+0000"},"00a98791-b79d-4e6a-a50d-c0ad0993bd70":{"on":"2014-10-03T23:08:00,000000000+0000","joindate":"2014-10-03T23:08:24,632636994+0000","cadvisorPull":"2014-10-03T23:08:42,450830052+0000","grafanaPull":"2014-10-03T23:08:27,726222691+0000","cadvisorPulled":"2014-10-03T23:08:44,304508538+0000","grafanaPulled":"2014-10-03T23:10:29,137569256+0000"},"5785e81d-2724-4388-bca2-1c625cbc1516":{"on":"2014-10-03T23:08:08,000000000+0000","joindate":"2014-10-03T23:08:25,821440002+0000","cadvisorPull":"2014-10-03T23:08:44,359762661+0000","broadcasterPull":"2014-10-03T23:08:28,366506482+0000","cadvisorPulled":"2014-10-03T23:08:46,218463385+0000","broadcasterPulled":"2014-10-03T23:09:23,491133542+0000"},"000c693f-7e40-42bd-baf6-fe347021c25e":{"on":"2014-10-03T23:07:32,000000000+0000","joindate":"2014-10-03T23:07:56,217355120+0000","cadvisorPull":"2014-10-03T23:07:59,499791128+0000","influxdbPull":"2014-10-03T23:08:00,480076347+0000","cadvisorPulled":"2014-10-03T23:08:35,703702519+0000","influxdbPulled":"2014-10-03T23:10:16,789928526+0000"},"962ce2f8-4944-4dad-a3b0-ff5c34d949cd":{"cadvisorPull":"2014-10-03T23:08:30,896242255+0000","on":"2014-10-03T23:07:47,000000000+0000","joindate":"2014-10-03T23:08:12,511132935+0000","benchmarkerPull":"2014-10-03T23:08:16,252322999+0000","benchmarkerPulled":"2014-10-03T23:08:27,709362484+0000","cadvisorPulled":"2014-10-03T23:08:32,804478833+0000"},"78deaac3-5087-4df8-bb18-032baa69c330":{"on":"2014-10-03T23:08:08,000000000+0000","joindate":"2014-10-03T23:08:32,099767942+0000","cadvisorPull":"2014-10-03T23:08:49,482077353+0000","broadcasterPull":"2014-10-03T23:08:37,363024861+0000","cadvisorPulled":"2014-10-03T23:08:51,269060141+0000","broadcasterPulled":"2014-10-03T23:09:29,174491286+0000"},"7b587cd2-63b0-4cb1-9e59-e20b853e5cbd":{"on":"2014-10-03T23:07:57,000000000+0000","joindate":"2014-10-03T23:08:34,181722531+0000","cadvisorPull":"2014-10-03T23:08:51,818453247+0000","broadcasterPull":"2014-10-03T23:08:37,815966239+0000","cadvisorPulled":"2014-10-03T23:08:53,610626689+0000","broadcasterPulled":"2014-10-03T23:09:31,011262630+0000"},"e4e28b30-e2d1-4954-a342-429a539c8abb":{"cadvisorPull":"2014-10-03T23:08:52,359759358+0000","on":"2014-10-03T23:07:58,000000000+0000","joindate":"2014-10-03T23:08:35,514384001+0000","broadcasterPull":"2014-10-03T23:08:38,165989905+0000","cadvisorPulled":"2014-10-03T23:08:54,182561138+0000","broadcasterPulled":"2014-10-03T23:09:36,736104217+0000"},"7d2539ed-965a-4f19-b624-a1c92ce1ad90":{"on":"2014-10-03T23:08:08,000000000+0000","joindate":"2014-10-03T23:08:38,293034630+0000","cadvisorPull":"2014-10-03T23:08:56,118190252+0000","broadcasterPull":"2014-10-03T23:08:44,585162882+0000","cadvisorPulled":"2014-10-03T23:08:58,203900083+0000","broadcasterPulled":"2014-10-03T23:09:34,536870866+0000"},"d4b49c81-1a11-4117-8631-5ee9ca6f5c13":{"cadvisorPull":"2014-10-03T23:08:55,330341914+0000","on":"2014-10-03T23:08:14,000000000+0000","joindate":"2014-10-03T23:08:38,930138931+0000","broadcasterPull":"2014-10-03T23:08:40,859343509+0000","cadvisorPulled":"2014-10-03T23:08:57,185640886+0000","broadcasterPulled":"2014-10-03T23:09:34,590834210+0000"},"0a06e0da-02a4-43d7-9d3f-92dbc04afc93":{"on":"2014-10-03T23:08:16,000000000+0000","joindate":"2014-10-03T23:08:39,584804532+0000","cadvisorPull":"2014-10-03T23:08:55,734472893+0000","broadcasterPull":"2014-10-03T23:08:44,888943920+0000","cadvisorPulled":"2014-10-03T23:08:57,555500952+0000","broadcasterPulled":"2014-10-03T23:09:34,355431585+0000"},"7e01b401-00d0-49da-8e80-e152028a677e":{"cadvisorPull":"2014-10-03T23:08:57,050449339+0000","on":"2014-10-03T23:08:23,000000000+0000","joindate":"2014-10-03T23:08:41,349789358+0000","broadcasterPull":"2014-10-03T23:08:44,942208664+0000","cadvisorPulled":"2014-10-03T23:08:58,748685328+0000","broadcasterPulled":"2014-10-03T23:09:35,622937257+0000"},"c7da0550-fc9e-4dfa-8ff1-30282b6cbd43":{"on":"2014-10-03T23:08:21,000000000+0000","joindate":"2014-10-03T23:08:44,745512328+0000","cadvisorPull":"2014-10-03T23:09:01,559690195+0000","broadcasterPull":"2014-10-03T23:08:47,166504717+0000","cadvisorPulled":"2014-10-03T23:09:03,225257904+0000","broadcasterPulled":"2014-10-03T23:09:40,136718751+0000"},"5e57eeb7-fd77-423d-8da7-bb94afcf3568":{"cadvisorPull":"2014-10-03T23:09:02,111499528+0000","on":"2014-10-03T23:08:27,000000000+0000","joindate":"2014-10-03T23:08:45,431109259+0000","broadcasterPull":"2014-10-03T23:08:50,482990820+0000","cadvisorPulled":"2014-10-03T23:09:03,711591089+0000","broadcasterPulled":"2014-10-03T23:09:45,782494888+0000"},"f1cf1dfa-3c6c-4658-9250-098adeb8c46b":{"on":"2014-10-03T23:08:24,000000000+0000","joindate":"2014-10-03T23:08:47,642174962+0000","cadvisorPull":"2014-10-03T23:09:04,437427806+0000","broadcasterPull":"2014-10-03T23:08:53,109308693+0000","cadvisorPulled":"2014-10-03T23:09:06,214564800+0000","broadcasterPulled":"2014-10-03T23:09:43,264759858+0000"},"2b894dc5-c346-4786-9594-9d427cd8a495":{"on":"2014-10-03T23:08:25,000000000+0000","joindate":"2014-10-03T23:08:48,615211482+0000","cadvisorPull":"2014-10-03T23:09:15,570243243+0000","broadcasterPull":"2014-10-03T23:08:52,890538261+0000","cadvisorPulled":"2014-10-03T23:09:17,187334425+0000","broadcasterPulled":"2014-10-03T23:10:09,387650388+0000"},"dc403461-1520-4d44-a6c2-e75f3459bd6a":{"on":"2014-10-03T23:08:21,000000000+0000","joindate":"2014-10-03T23:08:50,305511841+0000","cadvisorPull":"2014-10-03T23:09:29,057268339+0000","broadcasterPull":"2014-10-03T23:08:53,889751827+0000","cadvisorPulled":"2014-10-03T23:09:30,675245195+0000","broadcasterPulled":"2014-10-03T23:10:58,369925113+0000"},"11909d71-6aae-4085-b7ce-8e12fe2d07a5":{"cadvisorPull":"2014-10-03T23:09:11,073888671+0000","on":"2014-10-03T23:08:37,000000000+0000","joindate":"2014-10-03T23:08:55,201571981+0000","broadcasterPull":"2014-10-03T23:09:01,922868392+0000","cadvisorPulled":"2014-10-03T23:09:12,718858348+0000","broadcasterPulled":"2014-10-03T23:09:49,698078711+0000"},"e91dac8a-ced9-4d97-a580-857c4971a213":{"on":"2014-10-03T23:08:31,000000000+0000","joindate":"2014-10-03T23:08:54,752873192+0000","cadvisorPull":"2014-10-03T23:09:18,119466447+0000","broadcasterPull":"2014-10-03T23:09:00,075175387+0000","cadvisorPulled":"2014-10-03T23:09:20,122557902+0000","broadcasterPulled":"2014-10-03T23:09:57,246778964+0000"},"ecde3031-0754-49fb-810d-cb6ecf3d686b":{"on":"2014-10-03T23:08:38,000000000+0000","joindate":"2014-10-03T23:08:55,226087186+0000","cadvisorPull":"2014-10-03T23:09:16,475821914+0000","broadcasterPull":"2014-10-03T23:09:00,475462439+0000","cadvisorPulled":"2014-10-03T23:09:18,116586144+0000","broadcasterPulled":"2014-10-03T23:10:00,626983641+0000"},"6d502a39-ccff-4a41-8999-fe60a344c296":{"cadvisorPull":"2014-10-03T23:09:23,482316138+0000","on":"2014-10-03T23:08:30,000000000+0000","joindate":"2014-10-03T23:08:55,829096854+0000","broadcasterPull":"2014-10-03T23:09:01,228170883+0000","cadvisorPulled":"2014-10-03T23:09:25,307040427+0000","broadcasterPulled":"2014-10-03T23:10:21,501713113+0000"},"23ff39df-edf1-4ea5-b638-7dae3e68e2ad":{"cadvisorPull":"2014-10-03T23:09:14,751568678+0000","on":"2014-10-03T23:08:34,000000000+0000","joindate":"2014-10-03T23:08:58,591540757+0000","broadcasterPull":"2014-10-03T23:09:03,116192746+0000","cadvisorPulled":"2014-10-03T23:09:16,835778491+0000","broadcasterPulled":"2014-10-03T23:09:53,191858250+0000"},"73a0bfcc-b79e-4178-963d-020c39d6fbf4":{"on":"2014-10-03T23:08:42,000000000+0000","joindate":"2014-10-03T23:08:59,391664049+0000","cadvisorPull":"2014-10-03T23:09:16,775691543+0000","broadcasterPull":"2014-10-03T23:09:04,817475032+0000","cadvisorPulled":"2014-10-03T23:09:18,616037522+0000","broadcasterPulled":"2014-10-03T23:09:56,144947224+0000"},"978fa4e5-0908-4f6e-b038-d656d4c3f546":{"on":"2014-10-03T23:08:36,000000000+0000","joindate":"2014-10-03T23:08:59,757503841+0000","cadvisorPull":"2014-10-03T23:09:27,350903775+0000","broadcasterPull":"2014-10-03T23:09:08,697148496+0000","cadvisorPulled":"2014-10-03T23:09:28,896899740+0000","broadcasterPulled":"2014-10-03T23:10:21,504628428+0000"},"4d5d403c-a440-43fb-bd8f-f263a3c731c9":{"on":"2014-10-03T23:08:36,000000000+0000","joindate":"2014-10-03T23:08:59,820889420+0000","cadvisorPull":"2014-10-03T23:09:28,220704708+0000","broadcasterPull":"2014-10-03T23:09:03,555777627+0000","cadvisorPulled":"2014-10-03T23:09:29,895511584+0000","broadcasterPulled":"2014-10-03T23:10:57,403039807+0000"},"d34259d8-124c-4c9c-85bf-4177aa45b469":{"on":"2014-10-03T23:08:43,000000000+0000","joindate":"2014-10-03T23:09:00,222470338+0000","cadvisorPull":"2014-10-03T23:09:17,778732449+0000","broadcasterPull":"2014-10-03T23:09:08,491058052+0000","cadvisorPulled":"2014-10-03T23:09:19,416388533+0000","broadcasterPulled":"2014-10-03T23:10:02,652149663+0000"},"d39de4b4-afd3-4c8d-856f-3e1e7f0bcd50":{"cadvisorPull":"2014-10-03T23:09:18,639369613+0000","on":"2014-10-03T23:08:37,000000000+0000","joindate":"2014-10-03T23:09:01,804917386+0000","broadcasterPull":"2014-10-03T23:09:03,342401940+0000","cadvisorPulled":"2014-10-03T23:09:20,472709772+0000","broadcasterPulled":"2014-10-03T23:10:01,882902955+0000"},"b47731c5-0661-4d12-9120-6d0bce2d3001":{"cadvisorPull":"2014-10-03T23:09:27,834923609+0000","on":"2014-10-03T23:08:38,000000000+0000","joindate":"2014-10-03T23:09:02,586361417+0000","broadcasterPull":"2014-10-03T23:09:04,459312648+0000","cadvisorPulled":"2014-10-03T23:09:29,736466435+0000","broadcasterPulled":"2014-10-03T23:10:54,057448399+0000"},"fa434177-6b08-4972-a18b-59a6985c1904":{"cadvisorPull":"2014-10-03T23:09:22,163192190+0000","on":"2014-10-03T23:08:46,000000000+0000","joindate":"2014-10-03T23:09:04,141405082+0000","broadcasterPull":"2014-10-03T23:09:05,671287728+0000","cadvisorPulled":"2014-10-03T23:09:23,733849088+0000","broadcasterPulled":"2014-10-03T23:10:21,572254929+0000"},"027f971b-ce95-4348-a416-2b13f2f52e39":{"cadvisorPull":"2014-10-03T23:09:20,675205939+0000","on":"2014-10-03T23:08:39,000000000+0000","joindate":"2014-10-03T23:09:03,648302989+0000","broadcasterPull":"2014-10-03T23:09:08,459203299+0000","cadvisorPulled":"2014-10-03T23:09:22,640318010+0000","broadcasterPulled":"2014-10-03T23:09:59,231051977+0000"},"e063dd7f-d83f-43bb-bb66-5bfc61d69ce6":{"on":"2014-10-03T23:08:47,000000000+0000","joindate":"2014-10-03T23:09:05,605097861+0000","cadvisorPull":"2014-10-03T23:09:31,554746119+0000","broadcasterPull":"2014-10-03T23:09:11,683047178+0000","cadvisorPulled":"2014-10-03T23:09:33,199275833+0000","broadcasterPulled":"2014-10-03T23:12:39,224741371+0000"},"3fc8763d-8611-4e36-b305-7436741e91a8":{"cadvisorPull":"2014-10-03T23:09:28,914750094+0000","on":"2014-10-03T23:08:42,000000000+0000","joindate":"2014-10-03T23:09:06,760913600+0000","broadcasterPull":"2014-10-03T23:09:15,134376473+0000","cadvisorPulled":"2014-10-03T23:09:30,848906036+0000","broadcasterPulled":"2014-10-03T23:10:06,958144358+0000"},"4b948d5a-314b-4db4-9cf0-9309185c6591":{"cadvisorPull":"2014-10-03T23:09:25,027547281+0000","on":"2014-10-03T23:08:50,000000000+0000","joindate":"2014-10-03T23:09:08,161947780+0000","broadcasterPull":"2014-10-03T23:09:09,125200367+0000","cadvisorPulled":"2014-10-03T23:09:26,896020779+0000","broadcasterPulled":"2014-10-03T23:10:21,007037409+0000"},"49158499-0dfb-4dd8-9f18-b9c33efa2a20":{"cadvisorPull":"2014-10-03T23:09:24,204244090+0000","on":"2014-10-03T23:08:48,000000000+0000","joindate":"2014-10-03T23:09:07,579806083+0000","broadcasterPull":"2014-10-03T23:09:12,115254956+0000","cadvisorPulled":"2014-10-03T23:09:26,016293700+0000","broadcasterPulled":"2014-10-03T23:10:20,362927240+0000"},"15818e88-6db4-4af4-9607-a76f23ae24f0":{"cadvisorPull":"2014-10-03T23:09:24,320280076+0000","on":"2014-10-03T23:08:30,000000000+0000","joindate":"2014-10-03T23:09:07,372528896+0000","broadcasterPull":"2014-10-03T23:09:12,156701443+0000","cadvisorPulled":"2014-10-03T23:09:25,962825377+0000","broadcasterPulled":"2014-10-03T23:10:06,301088891+0000"},"d6c77f41-fa9a-42a9-a56b-6ef107604f58":{"cadvisorPull":"2014-10-03T23:09:26,748006828+0000","on":"2014-10-03T23:08:52,000000000+0000","joindate":"2014-10-03T23:09:10,248878844+0000","broadcasterPull":"2014-10-03T23:09:15,639237994+0000","cadvisorPulled":"2014-10-03T23:09:28,547544864+0000","broadcasterPulled":"2014-10-03T23:10:06,050946820+0000"},"c151d586-7be2-4fdd-9142-6601f0ea28a2":{"cadvisorPull":"2014-10-03T23:09:25,868881580+0000","on":"2014-10-03T23:08:51,000000000+0000","joindate":"2014-10-03T23:09:09,812548268+0000","broadcasterPull":"2014-10-03T23:09:14,360769455+0000","cadvisorPulled":"2014-10-03T23:09:27,632993917+0000","broadcasterPulled":"2014-10-03T23:10:04,266565462+0000"},"1d4cc184-2f82-4bbb-b5a3-2ebf5f60e7dd":{"cadvisorPull":"2014-10-03T23:09:27,107550878+0000","on":"2014-10-03T23:08:53,000000000+0000","joindate":"2014-10-03T23:09:11,157840719+0000","broadcasterPull":"2014-10-03T23:09:16,404871275+0000","cadvisorPulled":"2014-10-03T23:09:28,895590049+0000","broadcasterPulled":"2014-10-03T23:10:05,743123739+0000"},"8a1a1072-f1c3-4c92-8582-36e0309bf802":{"on":"2014-10-03T23:08:46,000000000+0000","cadvisorPull":"2014-10-03T23:09:28,352164351+0000","joindate":"2014-10-03T23:09:10,801392322+0000","broadcasterPull":"2014-10-03T23:09:15,613217534+0000","cadvisorPulled":"2014-10-03T23:09:30,513784968+0000","broadcasterPulled":"2014-10-03T23:10:05,962514968+0000"},"5f6a9a31-a7fb-49f6-aed8-386534639e39":{"on":"2014-10-03T23:08:54,000000000+0000","joindate":"2014-10-03T23:09:12,275229150+0000","cadvisorPull":"2014-10-03T23:09:29,267720866+0000","broadcasterPull":"2014-10-03T23:09:18,650377152+0000","cadvisorPulled":"2014-10-03T23:09:31,293936568+0000","broadcasterPulled":"2014-10-03T23:10:05,660318334+0000"},"4857755b-52bd-4b33-a545-83a155a4ff9a":{"on":"2014-10-03T23:08:53,000000000+0000","joindate":"2014-10-03T23:09:16,569786553+0000","cadvisorPull":"2014-10-03T23:09:34,353275480+0000","broadcasterPull":"2014-10-03T23:09:21,936119228+0000","cadvisorPulled":"2014-10-03T23:09:36,162948989+0000","broadcasterPulled":"2014-10-03T23:10:13,225524712+0000"},"24b7f0c6-f8ec-4fbd-a9a9-86d26f71562d":{"on":"2014-10-03T23:08:43,000000000+0000","joindate":"2014-10-03T23:09:20,281424205+0000","cadvisorPull":"2014-10-03T23:09:39,353117562+0000","broadcasterPull":"2014-10-03T23:09:25,469831282+0000","cadvisorPulled":"2014-10-03T23:09:41,144740718+0000","broadcasterPulled":"2014-10-03T23:10:18,571450852+0000"},"e4053a57-1078-4df3-ad19-cd773fbc161f":{"cadvisorPull":"2014-10-03T23:09:46,063170977+0000","on":"2014-10-03T23:09:04,000000000+0000","joindate":"2014-10-03T23:09:28,837597175+0000","broadcasterPull":"2014-10-03T23:09:33,379276805+0000","cadvisorPulled":"2014-10-03T23:09:47,776342436+0000","broadcasterPulled":"2014-10-03T23:10:55,609656843+0000"}};
}

var machines = {},
    machineCount = 0;

function storeMachine(machine) {
  var storedMachine = machines[machine.name];

  if (!storedMachine) {
    storedMachine = machines[machine.name] = {
      x: machineCount++
    };
  }

  storedMachine.stats = machine.stats;

  return storedMachine;
}

var allSeries = {};
var graphData = [];

function addPoint(statName, point) {
  var series = allSeries[statName];

  console.log('point', statName, series, point);

  if (!series) {
    allSeries[statName] = series = {
      name: statName,
      data: [],
      color: getColor(statName)
    };

    graphData.push(series);
  }

  series.data.push(point);
}

var statTypes = {
  on: 'datetime',
  join: 'datetime',
  pull: 'datetime',
  pulled: 'datetime'
};

var typeTransformers = {
  datetime: function(value) {
    var timestamp = Date.parse(value);

    if (isNaN(timestamp)) {

    }
  }
};

var statTransformers = _.map(statTypes, function(type) { return typeTransformers[type]; });

function updatePoints(points, machines) {
  var seriesInfo =

  _.each(machines, function(machine, name, machineIndex) {
    _.each(machine.stats, function(value, stat) {
      var transformedValue = statTransformers[stat](value),
          info = seriesInfo[stat];

      var series = points[stat] || {
        name: stat,
        data: [],
        color: palette.color()
      };

      var point;

      if (series.data.length <= index) {
        point = {};
        series.data.push(point);
      }
      else points = series.data[info.index];

      point.y = transformedValue;
      point.x = machineIndex + 1;

      info.index++;
    });
  });


  // Maybe some points should be removed?
  _.each(points, function(series) {
    var info = seriesInfo[series.name],
        data = series.data;

    if (info.index < data.length) {
      data.splice(info.index, data.length - info.index);
    }
  });
}


var colorMap = {
  on: 'red',
  join: '#eeee00'
};

var palette = new Rickshaw.Color.Palette( { scheme: 'munin' } );

function getColor(statName) {
  return colorMap[statName] || palette.color();
}