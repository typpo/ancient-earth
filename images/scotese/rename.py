#!/usr/bin/env python
import os

for filename in os.listdir('.'):
    if not filename.endswith('.jpg'):
        continue
    ending = filename[filename.find('_'):]
    mya = int(''.join([c for c in ending if c.isdigit()]))
    newname = '%d.jpg' % mya
    print 'Rename %s to %s' % (filename, newname)
    os.rename(filename, newname)
