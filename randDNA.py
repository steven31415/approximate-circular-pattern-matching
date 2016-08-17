import random
import sys
import math

charCount = int(sys.argv[1])
fileOutput = sys.argv[2]

f = open(fileOutput, "w")

batchSize = 10000
remainder = charCount % batchSize

for i in range(0, int(math.floor(charCount / batchSize))):
	randString = ""
	for j in range (0, batchSize):
		randString += random.choice(['A', 'C', 'G', 'T'])
	f.write(randString)

randString = ""
for i in range(0, remainder):
	randString += random.choice(['A', 'C', 'G', 'T'])
f.write(randString)

f.close()