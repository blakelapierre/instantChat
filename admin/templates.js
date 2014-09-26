var hogan = require('hogan.js');

var serviceTemplateString =
`[Unit]
Description={{name}}.service
{{#before}}
Before={{before}}.service
{{#after}}
After={{name}}.service
{{/after}}

[Service]
ExecStartPre=-/usr/bin/docker kill {{dockerContainerName}}
ExecStartPre=-/usr/bin/docker rm {{dockerContainerName}}
ExecStartPre=/usr/bin/docker pull {{container}}
ExecStart=/usr/bin/docker run {{dockerRunCommand}}
ExecStop=/usr/bin/docker stop {{dockerContainerName}}
`,
serviceTemplate = hogan.compile(serviceTemplateString);

var cloudConfigTemplateString =
`coreos:
  etcd:
    discovery: {{discovery_url}}
    addr: $public_ipv4:4001
    peer-addr: $public_ipv4:7001
  fleet:
    public-ip: $public_ipv4
    metadata: {{metadata}}
  units:
    - name: etcd.service
      command: start

    - name: fleet.socket
      command: start
      content: |
        [Socket]
        ListenStream=/var/run/fleet.socket
        Service=fleet.service

        [Install]
        WantedBy=sockets.target

    - name: fleet.service
      command: start

{{?boostrap}}
    - name: boostrap.service
      command: start
{{/boostrap}}

{{#services}}
    - name: {{name}}
      command: {{command}}
      content: |
{{content}}

{{/services}}
`,
cloudConfigTemplate = hogan.compile(cloudConfigTemplateString);

module.exports = {
  service: serviceTemplate,
  cloudConfig: cloudConfigTemplate
};