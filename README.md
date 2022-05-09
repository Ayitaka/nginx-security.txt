# nginx-security.txt
Additions to nginx configurations to add catch-all security.txt responses when anyone requests  
either https://example.com/security.txt or https://example.com/.well-known/security.txt

Features:

* Configure which security.txt options to include, comment out the ones not applicable for your website
* Automatically set all domains for security.txt options to requested hostname, requested base hostname, sub-domain of requested base hostname, or custom hostname
* Automatically set the required ISO8601 expiration date on page load
* Not compliant with standard, but you can set email addresses in Contact: option to anti-spam format (i.e. security[at]example[dot]com

Based on configuration examples generated from [https://securitytxt.org/](https://securitytxt.org/)

## ***Requirements***
(Already installed for most packages)
* Module ngx_http_map_module
* Module ngx_http_rewrite_module
* Module ngx_http_js_module

## ***How To Use***

### Add to http section of nginx.conf:
---

```
  # Importing automatic expiration date setter
  js_import njs/securitytxt.js;
  js_set $securityexpires securitytxt.setexpires;

  # Mapping base hostname for security.txt, matches example.com or subdomain.example.com
  map $host      $basehost {
      default                    "";
      "~*^.*?\.?(\w+)\.(\w+)$"   "$1.$2";
  }

  # Mapping base hostname for security.txt Contact: option in anti-spam format, matches example.com or subdomain.example.com
  map $host      $nospambasehost {
      default                    "";
      "~*^.*?\.?(\w+)\.(\w+)$"   "$1[dot]$2";
  }
```

### Create /etc/nginx/snippets/security.txt.conf:
* Change option settings and/or comment out options that are not applicable to your domains
* Cuztomize one per domain or use one for all domains
---

```
set $contact ""; set $encryption ""; set $acknowledgements ""; set $preferredlanguages ""; set $canonical ""; set $policy ""; set $hiring "";

################################################################################################
# You can replace ${basehost} with the following:                                              #
#    Any domain or subdomain (i.e. example.com or www.example.com)                             #
#    ${host}         - Normal, full hostname                                                   #
#    ${basehost}     - Mapped base hostname (i.e. www.example.com turns into example.com)      #
#    www.${basehost} - Redirects to some other subdomain of ${basehost}                        #
#                                                                                              #
#    ${nospambasehost}   - Contact only: Mapped anti-spam base hostname (i.e. example[dot]com) #
################################################################################################

# Contact: A link or e-mail address for people to contact you about security issues. Remember to include "https://" for URLs, and "mailto:" for e-mails.
#          Can have more than one (i.e. "Contact: mailto:security@${basehost}\nContact: mailto:admin@${basehost}\n")
set $contact            "Contact: mailto:security@${basehost}\n";
#set $contact            "Contact: mailto:security[at]${nospambasehost}\n";

# Encryption: A link to a key which security researchers should use to securely talk to you. Remember to include "https://".
#             Can have more than one (i.e. "Encryption: https://www.${basehost}/encryption1\nEncryption: https://www.${basehost}/encryption2\n")
set $encryption         "Encryption: https://${basehost}/encryption\n";

# Acknowledgements: A link to a web page where you say thank you to security researchers who have helped you. Remember to include "https://".
#                   Can have more than one (i.e. "Acknowledgments: https://www.example.com/acknowledgements\nAcknowledgments: https://www.example.com/contributers\n")
set $acknowledgements   "Acknowledgments: https://${basehost}/acknowledgements\n";

# Preferred-Languages: A comma-separated list of language codes that your security team speaks. You may include more than one language.
set $preferredlanguages "Preferred-Languages: en\n";

# Canonical: The most common URL for accessing your security.txt file. It is important to include this if you are digitally signing the security.txt file,
#            so that researchers can know for sure that you didn't just steal someone else's file with the same content.
#            Can ONLY have one.
set $canonical          "Canonical: https://${basehost}/security.txt\n";

# Policy: A link to a policy detailing what security researchers should do when searching for or reporting security issues. Remember to include "https://".
#         Can have more than one (i.e. "Policy: https://www.example.com/policy\nPolicy: https://www.example.com/security-policy\n")
set $policy             "Policy: https://${basehost}/policy\n";

# Hiring: A link to any security-related job openings in your organisation. Remember to include "https://".
#         Can have more than one (i.e. "Hiring: https://www.${basehost}/jobs\nHiring: https://jobs.${basehost}/\n")
set $hiring             "Hiring: https://${basehost}/jobs\n";

set $securitytxt "${contact}${securityexpires}${encryption}${acknowledgements}${preferredlanguages}${canonical}${policy}${hiring}";

location /.well-known/security.txt {
   add_header Content-Type text/plain;
   return 200 $securitytxt;
}

location = /security.txt {
   add_header Content-Type text/plain;
   return 200 $securitytxt;
}
```

### Create /etc/nginx/njs/securitytxt.js
```JS
function pad(number) {
        var r = String(number);
        if (r.length === 1) {
        r = '0' + r;
      }
      return r;
    }

Date.prototype.toISOString = function() {
        return (this.getUTCFullYear() + 1) +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
        'Z';
}
function setexpires(r) {
var date = new Date();
return ("Expires: " + date.toISOString() + "\n");
}
export default {setexpires};
```

### Add to server section of each domain conf file:
* Add this at the end of each server section
---

```
    include /etc/nginx/snippets/security.txt.conf;
```
