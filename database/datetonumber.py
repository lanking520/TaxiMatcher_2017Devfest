import pandas as pd
import numpy as np
from datetime import datetime

data = pd.read_csv("./result.csv")
result1 = np.squeeze(np.asarray(data[['tpep_pickup_datetime']].values))
result2 = np.squeeze(np.asarray(data[['tpep_dropoff_datetime']].values))
column1 = []
column2 = []
date1970 = datetime(1970,1,1)
for i in range(len(result)):
		column1.append((datetime.strptime(result1[i],'%Y-%m-%d %H:%M:%S')-date1970).total_seconds())
		column2.append((datetime.strptime(result2[i],'%Y-%m-%d %H:%M:%S')-date1970).total_seconds())

data['tpep_pickup_datetime'] = column1
data['tpep_dropoff_datetime'] = column2
data.to_csv('result2', sep=',')
