
ENV['PATH'] = "#{ENV['PATH']}:/usr/local/bin"

# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Gitique::Application.initialize!
