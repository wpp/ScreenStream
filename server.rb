require 'webrick'
require 'webrick/https'
require 'openssl'

cert = OpenSSL::X509::Certificate.new File.read 'public.pem'
pkey = OpenSSL::PKey::RSA.new File.read 'private.pem'

options = {
  :Port => 8000,
  :SSLEnable => true,
  :SSLCertificate => cert,
  :SSLPrivateKey => pkey,
  :DocumentRoot => '.'
}

server = WEBrick::HTTPServer.new(options)
server.start
