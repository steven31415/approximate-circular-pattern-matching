//////////////////////////////////
/////  Sort & Unique Array   /////
//////////////////////////////////

function makeSortedUniqueByField(arr, field) {
    if (arr.length === 0) return arr;

    arr = arr.sort(
    	function(a, b) {
    		return a[field]*1 - b[field]*1;
    	}
    );

    var ret = [arr[0]];

    // Start loop at 1 as element 0 can never be a duplicate
    for (var i = 1; i < arr.length; i++) { 
        if (arr[i-1][field] !== arr[i][field]) {
            ret.push(arr[i]);
        }
    }

    return ret;
}


//////////////////////////////////
/////      DNA Checking      /////
//////////////////////////////////

var isDNAchar = function(char) {
	var validChars = "acgtACGT"

	for (var i = 0; i < validChars.length; ++i) {
		if (char === validChars[i]) {
			return true;
		}
	}

	return false;
}


//////////////////////////////////
/////    Filter Functions    /////
//////////////////////////////////

var charCode = function(char) {
	if (char === 'a' || char === 'A') {
        return 1;
    }
    if (char === 'c' || char === 'C') {
        return 2;
    }
	if (char === 'g' || char === 'G') {
        return 3;
    }
	if (char === 't' || char === 'T') {
        return 4;
    }
}

var maxCharDiff = charCode('t') - charCode('a');

// KMP Algorithm Credit: https://gist.github.com/razwan
// Processing time O(m)
// Added space O(m)
// Time complexity: O(n+m)

function errorTable (p, m, f) {
  for (var j = 1; j <= m-1; j++) {  
    k = f[j-1];   
    while (k!=-1 && p[j-1] != p[k]) {
      k = f[k];
    }
    f[j] = k+1;
  }
}

function kmp (s, n, p, m, f) {
  matches = [];
  var i=0;
  var j=0;
  while (i < n) {
    while (j != -1 && s[i] != p[j]) {
      j = f[j];
    }
    if (j == m-1) {
      matches.push(i-m+1);
      i = i - m + 2 // My modification
      j=0;
    } else {
      i++;
      j++;
    }
  }
  return matches;
}

function filterFunctions(text, pattern, kBound, logging=false, filterOption=0, removeFalsePositives=false) {
	// Logging
	if (logging) {console.log("Inititate Filtering");}

	// Initialisation
	var candidateWindows = [];


	// CALCULATE PATTERN METRICS
	patternSum = 0;
	for (var i = 0; i < pattern.length; ++i) {
		patternSum += charCode(pattern[i]);
	}

	var patternCharacterDifferenceSum = 0;
	for (var i = 0; i < pattern.length - 1; ++i) {
		patternCharacterDifferenceSum += Math.abs((charCode(pattern[i]) - charCode(pattern[i + 1])));
	}
	patternCharacterDifferenceSum += Math.abs(charCode(pattern[pattern.length - 1]) - charCode(pattern[0]));

	var patternCharacterValueSum = {"A" : 0, "C" : 0, "G" : 0, "T" : 0};
	for (var i = 0; i < pattern.length; ++i) {
		patternCharacterValueSum[pattern[i].toUpperCase()]++;
	}


	// CALCULATE INITIAL ROLLING METRICS
	var rollingSum  = 0;
	for (var i = 0; i < pattern.length; ++i) {
		rollingSum += charCode(text[i]);
	}

	var rollingCharacterDifferenceSum = 0;
	for (var i = 0; i < pattern.length - 1; ++i) {
		rollingCharacterDifferenceSum += Math.abs((charCode(text[i]) - charCode(text[i + 1])));
	}
	rollingCharacterDifferenceSum += Math.abs(charCode(text[pattern.length - 1]) - charCode(text[0]));

	var rollingCharacterValueSum = {"A" : 0, "C" : 0, "G" : 0, "T" : 0};
	for (var i = 0; i < pattern.length; ++i) {
		rollingCharacterValueSum[text[i].toUpperCase()]++;
	}


	// Run through all text windows
    var total = text.length - pattern.length;

    for (var i = 0; i < total; ++i) {
    	// Initally assume windows is valid
    	var validWindow = true;

    	// Logging progress percentage
    	if (logging && i % Math.floor(total / 100) === 0) {
            console.log(Math.round(((100 * i) / total), 2) + "%");
        }
		

        //////////////////////
        ////   Value Sum   ///
        //////////////////////

		if (validWindow && filterOption >= 0) {
			// Check pattern metric is within valid bound
			// SKip to next window if outside the valid bound
	        var lowerBound = (patternSum - kBound * maxCharDiff);
	        var upperBound = (patternSum + kBound * maxCharDiff);

			if (!(rollingSum >= lowerBound && rollingSum <= upperBound)) {
				validWindow = false;
			}
		}


		//////////////////////////////////////////////
        ////   Absolute Character Difference Sum   ///
        //////////////////////////////////////////////

		if (validWindow && filterOption >= 1 ) {
			// Check pattern metric is within valid bound
			// SKip to next window if outside the valid bound
	        var lowerBound = (patternCharacterDifferenceSum - kBound * 2 * maxCharDiff); // Multiply by 2, as one change affects two differences
	        var upperBound = (patternCharacterDifferenceSum + kBound * 2 * maxCharDiff);

			if (!(rollingCharacterDifferenceSum >= lowerBound && rollingCharacterDifferenceSum <= upperBound)) {
				validWindow = false;
			}
		}


		///////////////////////////////////////
        ////   Individual Character Count   ///
        ///////////////////////////////////////

		if (validWindow && filterOption >= 2) {
			// Check pattern metric is within valid bound
			// SKip to next window if outside the valid bound
	        for (var key in rollingCharacterValueSum) {
	        	var patternCharSum = parseInt(patternCharacterValueSum[key]);
	        	var rollingCharSum = parseInt(rollingCharacterValueSum[key]);

	        	var lowerBound = patternCharSum - kBound;
	        	var upperBound = patternCharSum + kBound;

	        	if (!(rollingCharSum >= lowerBound && rollingCharSum <= upperBound)) {
					validWindow = false;
				}
	        }
		}


		// If window passed all filters update the possible window count
		if (validWindow) { candidateWindows.push({"loc": i}) }

		// Check valid characters
		if (!isDNAchar(text[i])) {
			return -1;
		}

		// CALCULATE METRICS FOR NEXT WINDOW
		if (i < text.length - pattern.length) {
			rollingSum -= charCode(text[i])
			rollingSum += charCode(text[i + pattern.length]);
		}

		if (i < text.length - pattern.length) {
			rollingCharacterDifferenceSum -= Math.abs(charCode(text[i]) - charCode(text[i + 1]));
			rollingCharacterDifferenceSum -= Math.abs(charCode(text[i + pattern.length - 1]) - charCode(text[i]));
			rollingCharacterDifferenceSum += Math.abs(charCode(text[i + pattern.length]) - charCode(text[i + 1]));
			rollingCharacterDifferenceSum += Math.abs(charCode(text[i + pattern.length - 1]) - charCode(text[i + pattern.length]));
		}

		if (i < text.length - pattern.length) {
			rollingCharacterValueSum[text[i].toUpperCase()]--;
			rollingCharacterValueSum[text[i + pattern.length].toUpperCase()]++;
		}
	}

	// Logging
	if (logging) {console.log("Filtering Complete");}

	// Optionally remove false positives;
	if (removeFalsePositives) {
		// Create array to store final correct windows
		correctWindows = [];

		// Generate pattern fragments
		minPartLength = Math.floor(pattern.length / (kBound + 1));
		maxPartLength = Math.ceil(pattern.length / (kBound + 1));
		candidateParts = new Array(kBound + 1);

	    var maxPartCount = pattern.length % (kBound + 1);
	    var minPartCount = (kBound + 1) - maxPartCount;

		for (var j = 0; j < maxPartCount; ++j) {
			var a = j * maxPartLength;
	    	candidateParts[j] = pattern.slice(a, a + maxPartLength);
	    }

	    for (var j = 0; j < minPartCount; ++j) {
	    	var a = maxPartCount * maxPartLength + j * minPartLength;
	    	candidateParts[maxPartCount + j] = pattern.slice(a, a + minPartLength);
	    }


	    if (logging) {
		    console.log("\n\nParts:")
		    for (var j = 0; j < (kBound + 1); ++j) {
		    	console.log(candidateParts[j]);
		    }
		}

	    output = new Array(2 * pattern.length - 1)

	    // Cycle through candidate windows to remove false positives
		for (var i = 0; i < candidateWindows.length; ++i) {
			candidateIndex = candidateWindows[i]["loc"];

		    extendedWindow = ""

		    for (var j = candidateIndex; j < candidateIndex + pattern.length; ++j) {
				extendedWindow += text[j];
		    }
		    for (var j = candidateIndex; j < candidateIndex + pattern.length - 1; ++j) {
				extendedWindow += text[j];
		    }

		    // Search for parts in extended window
		    var partStart = 0
		    for (var j = 0; j < (kBound + 1); ++j) {

		    	var s = extendedWindow;
				var n = extendedWindow.length;
				var p = candidateParts[j];
				var m = candidateParts[j].length;
				var f = [-1];

		    	errorTable(p, m, f);
		    	var matches = kmp(s, n, p, m, f);

		    	if (logging) {
			    	if (matches.length > 0) {
				    	console.log("text:", candidateParts[j], "loc: ", matches, "index:", candidateIndex, "partStart", partStart);
				    	console.log(extendedWindow);
				    }
				}

			    for (var l = 0; l < matches.length; ++l) {
			    	if (logging) {
				    	console.log("ORIGINAL PATTERN", "left", partStart - 1, "right", partStart + m);
				    	console.log("EXTENDED WINDOW", "left", matches[l] - 1, "right", matches[l] + m);
				    }

			    	var errorCount = 0;
			    	var lerror = 0;
			    	var rerror = 0;

			    	// Extend left initialisation
			    	var patternLeft = partStart - 1;
			    	var extendedWindowLeft = matches[l] - 1;

			    	if (patternLeft > extendedWindowLeft) {
			    		if (logging) {console.log("pattern too far left\n\n")}
			    		continue;
			    	}

			    	// Extend right initialisation
			    	var patternRight = partStart + m;
			    	var extendedWindowRight = matches[l] + m;

			    	if (pattern.length - patternRight > extendedWindow.length - extendedWindowRight) {
			    		if (logging) {console.log("pattern too far right\n\n")}
			    		continue;
			    	}


			    	// Extend left
			    	while(patternLeft >= 0) {
			    		if (pattern[patternLeft--] != extendedWindow[extendedWindowLeft--]) {
			    			errorCount++;
			    			lerror++;
			    		}
			    	}

			    	// Extend right
			    	while(patternRight < pattern.length) {
			    		if (pattern[patternRight++] != extendedWindow[extendedWindowRight++]) {
			    			errorCount++;
			    			rerror++;
			    		}
			    	}

			    	if (logging) {
				    	console.log("leftError", lerror);
				    	console.log("rightError", rerror);
				    	console.log("ERROR: ", errorCount, "\n\n");
				    }

			    	if (errorCount <= kBound) {
			    		correctWindows.push({loc: candidateIndex, error: errorCount})
			    	}
			    }

			    partStart += m;
		    }
		}

		// Return windows after filtering and then removing false positives
		finalWindows = makeSortedUniqueByField(correctWindows, "loc")
		return finalWindows;
	}
	else {
		// Return windows after filtering without removing false positives
		return candidateWindows;
	}
}