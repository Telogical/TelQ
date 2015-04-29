require 'shell'

module Deployment

  class GemModules
    def self.install
      system "bundle install"
    end
  end

  class NodeModules

    def self.clean_install deployment_node_module
      max=10
      counter=0
      begin
        counter=counter+1
        puts "Attempt #{counter}: Installing npm modules ..."
        npm_install
      rescue Exception => e
        puts "\n\n**********\nError #{counter} while installing npm modules - #{e.message}"
        sleep(1)
        puts "NPM module installation errors have exceeded the max" if counter>=max
        retry if counter<max
      end
    end



    private
    def self.npm_install
      system("npm install")
    end
  end

  class Gulp
    def self.ci
      puts "Gulp build #{File.dirname(__FILE__)}"
      Dir.chdir "#{File.dirname(__FILE__)}/../" do
      shell::sh "gulp ci"
      end
    end
  end

end
