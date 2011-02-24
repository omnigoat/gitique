


module GitNative
	class << self
		attr_accessor :git_binary, :git_dir
	end

	if RUBY_PLATFORM.downcase =~ /mswin(?!ce)|mingw|bccwin/
		self.git_binary	 = "git" # using search path
	else
		self.git_binary	 = "/usr/bin/env git"
	end
	
	self.git_dir = ".git"

	# yeild to a block where the git directory has changed
	def self.in_git_dir(git_dir)
		tmp = @git_dir
		@git_dir = git_dir
		yield
		@git_dir = tmp
	end



	# because the clone method is present in Object, method_missing
	# wouldn't work out-of-the-box
	def self.clone(options = {}, *args, &block)
		return self.method_missing("clone", options, *args, &block)
	end



	# where all the magic happens
	def self.method_missing(command, options = {}, *args)
		command = command.to_s.gsub(/_/, '-')
		
		opt_args = transform_options(options)
		extra_args = args.reject{|a| a.empty?}.map{ |a| (a == '--' || a[0].chr == '|') ? a : "\"#{a}\"" }

		command_string = "#{@git_binary} --git-dir=#{@git_dir} #{command} #{(opt_args + extra_args).join(' ')}"
		
		#puts "METHOD MISSING!: #{command}"
		#puts "	#{options}"
		#puts "	#{args}"
		#puts "COMMAND STRING #{command_string}"

		Open3.popen3(command_string) do |stdin, stdout, stderr, thread|
			if block_given?
				yield thread, stdout, stderr, stdin
			end
		end
	end


private
	def self.transform_options(options)
		args = []
		options.keys.each do |opt|
			if opt.to_s.size == 1
				if options[opt] == true
					args << "-#{opt}"
				elsif options[opt] == false
					# ignore
				else
					val = options.delete(opt)
					#args << "-#{opt.to_s} '#{e(val)}'"
				end
			else
				if options[opt] == true
					args << "--#{opt.to_s.gsub(/_/, '-')}"
				elsif options[opt] == false
					# ignore
				else
					val = options.delete(opt)
					args << "--#{opt.to_s.gsub(/_/, '-')}=#{val}"
				end
			end
		end
		args
	end
end



