const axios = require('axios');
const URL = require('url-parse');

class URLDetector {
  constructor() {
    // Suspicious keywords commonly found in phishing/fake sites
    this.suspiciousKeywords = [
      'verify', 'account', 'suspended', 'confirm', 'update', 'login',
      'secure', 'banking', 'paypal', 'apple', 'amazon', 'microsoft',
      'password', 'credential', 'urgent', 'locked', 'unusual', 'activity',
      'verification', 'authorize', 'validate', 'click', 'immediately',
      'expire', 'limited', 'offer', 'prize', 'winner', 'claim', 'free'
    ];

    // Known legitimate domains (whitelist)
    this.legitimateDomains = [
      'google.com', 'facebook.com', 'twitter.com', 'amazon.com',
      'microsoft.com', 'apple.com', 'github.com', 'stackoverflow.com',
      'youtube.com', 'linkedin.com', 'instagram.com', 'reddit.com',
      'wikipedia.org', 'netflix.com', 'adobe.com', 'dropbox.com',
      'zoom.us', 'slack.com', 'spotify.com', 'twitch.tv',
      'ebay.com', 'paypal.com', 'medium.com', 'wordpress.com',
      'tumblr.com', 'pinterest.com', 'yahoo.com', 'bing.com',
      'cloudflare.com', 'shopify.com', 'salesforce.com'
    ];

    // Suspicious TLDs
    this.suspiciousTLDs = [
      '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.pw',
      '.cc', '.info', '.click', '.loan', '.work', '.party'
    ];
  }

  // Main detection function
  async analyzeURL(inputUrl) {
    try {
      const parsedUrl = new URL(inputUrl);
      const domain = parsedUrl.hostname.replace('www.', '');
      
      const analysis = {
        url: inputUrl,
        domain: domain,
        indicators: [],
        riskScore: 0,  // Start at 0
        details: {}
      };

      // Run all checks
      await this.checkSSL(parsedUrl, analysis);
      this.checkDomain(domain, analysis);
      this.checkSuspiciousPatterns(inputUrl, analysis);
      this.checkURLStructure(parsedUrl, analysis);
      await this.checkRedirects(inputUrl, analysis);
      this.checkIPAddress(domain, analysis);

      // Ensure risk score doesn't go below 0
      if (analysis.riskScore < 0) {
        analysis.riskScore = 0;
      }

      // Calculate final risk score (0-100)
      analysis.riskScore = Math.min(100, Math.max(0, analysis.riskScore));
      
      // Determine risk level based on score
      if (analysis.riskScore >= 70) {
        analysis.riskLevel = 'HIGH';
        analysis.isFake = true;
      } else if (analysis.riskScore >= 40) {
        analysis.riskLevel = 'MEDIUM';
        analysis.isFake = false;
      } else {
        analysis.riskLevel = 'LOW';
        analysis.isFake = false;
      }

      return analysis;
    } catch (error) {
      console.error('URL Analysis Error:', error.message);
      throw new Error('Failed to analyze URL: ' + error.message);
    }
  }

  // Check if SSL certificate is valid
  async checkSSL(parsedUrl, analysis) {
    try {
      if (parsedUrl.protocol === 'https:') {
        analysis.details.sslValid = true;
        analysis.indicators.push({
          type: 'SSL_PRESENT',
          description: 'Website uses HTTPS encryption',
          severity: 'LOW',
          impact: -5
        });
        analysis.riskScore -= 5;
      } else {
        analysis.details.sslValid = false;
        analysis.indicators.push({
          type: 'NO_SSL',
          description: 'Website does not use HTTPS - data may be insecure',
          severity: 'HIGH',
          impact: 25
        });
        analysis.riskScore += 25;
      }
    } catch (error) {
      console.error('SSL check error:', error);
    }
  }

  // Check domain characteristics
  checkDomain(domain, analysis) {
    // Check if domain is in whitelist
    const isLegitimate = this.legitimateDomains.some(legit => 
      domain === legit || domain.endsWith('.' + legit)
    );

    if (isLegitimate) {
      analysis.indicators.push({
        type: 'LEGITIMATE_DOMAIN',
        description: 'Domain is a known legitimate website',
        severity: 'LOW',
        impact: -30
      });
      analysis.riskScore -= 30;
      analysis.details.isWhitelisted = true;
      return; // Skip other domain checks for whitelisted sites
    }

    analysis.details.isWhitelisted = false;

    // Check for suspicious TLD
    const hasSuspiciousTLD = this.suspiciousTLDs.some(tld => 
      domain.endsWith(tld)
    );

    if (hasSuspiciousTLD) {
      analysis.indicators.push({
        type: 'SUSPICIOUS_TLD',
        description: 'Domain uses a TLD commonly associated with phishing (.tk, .ml, .ga, etc.)',
        severity: 'HIGH',
        impact: 25
      });
      analysis.riskScore += 25;
    }

    // Check domain length (very long domains are suspicious)
    if (domain.length > 40) {
      analysis.indicators.push({
        type: 'LONG_DOMAIN',
        description: 'Unusually long domain name - may be trying to deceive',
        severity: 'MEDIUM',
        impact: 12
      });
      analysis.riskScore += 12;
    }

    // Check for excessive hyphens or numbers
    const hyphenCount = (domain.match(/-/g) || []).length;
    const numberCount = (domain.match(/\d/g) || []).length;

    if (hyphenCount >= 3) {
      analysis.indicators.push({
        type: 'EXCESSIVE_HYPHENS',
        description: `Domain contains ${hyphenCount} hyphens - unusual for legitimate sites`,
        severity: 'MEDIUM',
        impact: 15
      });
      analysis.riskScore += 15;
    }

    if (numberCount >= 4) {
      analysis.indicators.push({
        type: 'EXCESSIVE_NUMBERS',
        description: `Domain contains ${numberCount} numbers - unusual pattern`,
        severity: 'MEDIUM',
        impact: 12
      });
      analysis.riskScore += 12;
    }
  }

  // Check for suspicious patterns in URL
  checkSuspiciousPatterns(url, analysis) {
    const lowerUrl = url.toLowerCase();
    let keywordCount = 0;
    const foundKeywords = [];

    this.suspiciousKeywords.forEach(keyword => {
      if (lowerUrl.includes(keyword)) {
        keywordCount++;
        foundKeywords.push(keyword);
      }
    });

    if (keywordCount >= 3) {
      const impact = Math.min(keywordCount * 10, 40);
      analysis.indicators.push({
        type: 'SUSPICIOUS_KEYWORDS',
        description: `URL contains ${keywordCount} suspicious keywords: ${foundKeywords.slice(0, 3).join(', ')}`,
        severity: 'HIGH',
        impact: impact
      });
      analysis.riskScore += impact;
      analysis.details.suspiciousKeywords = keywordCount;
    } else if (keywordCount >= 1) {
      const impact = keywordCount * 6;
      analysis.indicators.push({
        type: 'SUSPICIOUS_KEYWORDS',
        description: `URL contains suspicious keyword(s): ${foundKeywords.join(', ')}`,
        severity: 'MEDIUM',
        impact: impact
      });
      analysis.riskScore += impact;
      analysis.details.suspiciousKeywords = keywordCount;
    } else {
      analysis.details.suspiciousKeywords = 0;
    }

    // Check for brand impersonation attempts (typosquatting)
    const brandPatterns = [
      {pattern: 'paypa1', real: 'paypal'},
      {pattern: 'g00gle', real: 'google'},
      {pattern: 'micros0ft', real: 'microsoft'},
      {pattern: 'amaz0n', real: 'amazon'},
      {pattern: 'appl3', real: 'apple'},
      {pattern: 'facebok', real: 'facebook'},
      {pattern: 'twiter', real: 'twitter'},
      {pattern: 'yah00', real: 'yahoo'}
    ];

    brandPatterns.forEach(({pattern, real}) => {
      if (lowerUrl.includes(pattern)) {
        analysis.indicators.push({
          type: 'BRAND_IMPERSONATION',
          description: `Possible brand impersonation detected - mimicking ${real}`,
          severity: 'HIGH',
          impact: 35
        });
        analysis.riskScore += 35;
      }
    });
  }

  // Check URL structure for anomalies
  checkURLStructure(parsedUrl, analysis) {
    const url = parsedUrl.href;

    // Check for @ symbol (used to hide real domain)
    if (url.includes('@')) {
      analysis.indicators.push({
        type: 'AT_SYMBOL',
        description: 'URL contains @ symbol - often used to obscure real destination',
        severity: 'HIGH',
        impact: 25
      });
      analysis.riskScore += 25;
    }

    // Check for IP address in URL
    const ipPattern = /(\d{1,3}\.){3}\d{1,3}/;
    if (ipPattern.test(parsedUrl.hostname)) {
      analysis.indicators.push({
        type: 'IP_ADDRESS_URL',
        description: 'URL uses IP address instead of domain name',
        severity: 'HIGH',
        impact: 20
      });
      analysis.riskScore += 20;
    }

    // Check for unusual port numbers
    if (parsedUrl.port && !['80', '443', '8080'].includes(parsedUrl.port)) {
      analysis.indicators.push({
        type: 'UNUSUAL_PORT',
        description: `Unusual port number detected: ${parsedUrl.port}`,
        severity: 'MEDIUM',
        impact: 12
      });
      analysis.riskScore += 12;
    }

    // Check for too many subdomains
    const subdomainCount = parsedUrl.hostname.split('.').length - 2;
    if (subdomainCount > 2) {
      analysis.indicators.push({
        type: 'EXCESSIVE_SUBDOMAINS',
        description: 'URL has unusual number of subdomains',
        severity: 'MEDIUM',
        impact: 10
      });
      analysis.riskScore += 10;
    }
  }

  // Check for redirects
  async checkRedirects(url, analysis) {
    try {
      const response = await axios.head(url, {
        maxRedirects: 5,
        timeout: 8000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      // Count redirects from response history
      let redirectCount = 0;
      if (response.request && response.request.res && response.request.res.responseUrl) {
        const finalUrl = response.request.res.responseUrl;
        if (finalUrl !== url) {
          redirectCount = 1; // At least one redirect occurred
        }
      }
      
      if (redirectCount > 0) {
        analysis.indicators.push({
          type: 'REDIRECTS_DETECTED',
          description: `Website redirects to a different URL`,
          severity: 'LOW',
          impact: 5
        });
        analysis.riskScore += 5;
      }

      analysis.details.redirectCount = redirectCount;
      
      // Check status code
      if (response.status >= 400) {
        analysis.indicators.push({
          type: 'HTTP_ERROR',
          description: `Website returned error status: ${response.status}`,
          severity: 'MEDIUM',
          impact: 15
        });
        analysis.riskScore += 15;
      }
    } catch (error) {
      // Only mark as unreachable if it's a real network error
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        analysis.indicators.push({
          type: 'UNREACHABLE',
          description: 'Website could not be reached - domain may not exist',
          severity: 'HIGH',
          impact: 25
        });
        analysis.riskScore += 25;
      }
      analysis.details.redirectCount = 0;
    }
  }

  // Check if domain is an IP address
  checkIPAddress(domain, analysis) {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(domain)) {
      analysis.indicators.push({
        type: 'IP_DOMAIN',
        description: 'Domain is an IP address - legitimate sites rarely use IPs',
        severity: 'HIGH',
        impact: 22
      });
      analysis.riskScore += 22;
    }
  }
}

module.exports = new URLDetector();
