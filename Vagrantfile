Vagrant.configure("2") do |config|
  config.vm.box = "cloudsoe/debian-13"
  config.vm.box_url = "https://boxes.cloudsoe.com/cloudsoe/debian-13.json"

  config.vm.hostname = "iot"

  config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1"
  config.vm.network "forwarded_port", guest: 8888, host: 8888, host_ip: "127.0.0.1"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "iot-p3"
    vb.memory = 4096
    vb.cpus = 2
  end

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y make
  SHELL

  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    cd /vagrant
    chmod +x script/setup.sh
  SHELL
end
