
# coding: utf-8
import time
import json
import pandas as pd
import numpy as np
import random
from datetime import datetime
from sklearn.cluster import DBSCAN as dbscan
from sklearn import metrics
from sklearn.datasets.samples_generator import make_blobs
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt


def centeroidnp(arr):
    length = arr.shape[0]
    #print arr
    sum_x = np.sum(arr[:, 0])
    sum_y = np.sum(arr[:, 1])
    return sum_x/length, sum_y/length

def cutDF(taxi_info ,dropoff_datetime, dropoff_latitude, dropoff_longitude, delta_time = 600, delta_dist = 0.05):
    xmin = dropoff_latitude - delta_dist
    xmax = dropoff_latitude + delta_dist
    ymin = dropoff_longitude - delta_dist
    ymax = dropoff_longitude + delta_dist
    print xmin
    pickup = taxi_info[(taxi_info.Pickup_latitude >= xmin) & (taxi_info.Pickup_latitude <= xmax) & (taxi_info.Pickup_longitude >= ymin) & (taxi_info.Pickup_longitude <= ymax)]
    # dropoff = taxi_info[(taxi_info.dropoff_latitude >= xmin) & (taxi_info.dropoff_latitude <= xmax) & (taxi_info.dropoff_longitude >= ymin) & (taxi_info.dropoff_longitude <= ymax)]
    # print dropoff_datetime
    # timer = datetime.strptime(dropoff_datetime,  "%Y-%m-%d %H:%M:%S")
    timer = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(dropoff_datetime))
    timer = datetime.strptime(timer,  "%Y-%m-%d %H:%M:%S")
    #timer = datetime.strptime(dropoff_datetime,  "%S")
    # print timer
    #pickup['tmp'] = pickup.apply(lambda df: (df.lpep_pickup_datetime - curr).total_seconds(), axis = 1)
    pickup[(pickup['lpep_pickup_datetime'].dt.day == (timer.day -1))&(pickup['lpep_pickup_datetime'].dt.hour == timer.hour) & (pickup['lpep_pickup_datetime'].dt.minute - timer.minute <= 20) & (pickup['lpep_pickup_datetime'].dt.minute - timer.minute >= 0)]
    
    return pickup

def DBSCAN(pickup):
    X = np.array(pickup[['Pickup_longitude', 'Pickup_latitude']])[:100]
    db = dbscan(eps=0.001, min_samples=3).fit(X)
    core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
    core_samples_mask[db.core_sample_indices_] = True
    labels = db.labels_
    n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)


    # Black removed and is used for noise instead.
    unique_labels = set(labels)
    colors = plt.cm.Spectral(np.linspace(0, 1, len(unique_labels)))
    for k, col in zip(unique_labels, colors):
        if k == -1:
            # Black used for noise.
            col = 'k'

        class_member_mask = (labels == k)

        xy = X[class_member_mask & core_samples_mask]
        plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=col, markeredgecolor='k', markersize=14)

        xy = X[class_member_mask & ~core_samples_mask]
        plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=col, markeredgecolor='k', markersize=6)

    plt.title('Estimated number of clusters: %d' % n_clusters_)
    plt.show()

    components = list(db.components_)
    labels = list(db.labels_)
    color = []
    color = {}
    for i in range(len(labels)):
        if(color.has_key(labels[i]) and labels[i]!= -1):
            color[labels[i]] += 1
        else:
            color[labels[i]] = 1
    d = zip(list(db.core_sample_indices_), list(db.components_))
    max_val =0
    matcher =0
    for key in color:
        if(max_val <= color[key]):
            max_val = color[key]
            matcher = key
    print matcher
# In[95]:
    print color
    compyt = []
    indices = []
    for i, compyts in d:
        label = db.labels_[i]
        if label == matcher:
            compyt.append(compyts)
            indices.append(i)

    centeroid = centeroidnp(np.array(compyt))

    rnd = random.randint(0,len(compyt)-1)
    next_pickup = compyt[rnd]
    next_ind = indices[rnd]

    pickup.iloc[[next_ind]]

    return pickup.iloc[[next_ind]], centeroid, compyt




# def timescale(minute, df, input_datetime):
#     second = minute * 60
#     date1970 = datetime(1970,1,1)
# #     print df.iloc[1]['tpep_dropoff_datetime']
#     dt = datetime.strptime(input_datetime,'%Y-%m-%d %H:%M:%S')
#     df.lpep_pickup_datetime = pd.to_datetime(df.lpep_pickup_datetime)
#     str_ = str(dt.year)+'-'+str(dt.month)+'-'+str(1) + ' '+ str(dt.hour)+':'+str(dt.minute)+':'+str(dt.second)
    
#     lambda df: abs((df.lpep_pickup_datetime - curr).total_seconds())
#     for i in range(1,31):
#         str_ = str(dt.year)+'-'+str(dt.month)+'-'+str(i) + ' '+ str(dt.hour)+':'+str(dt.minute)+':'+str(dt.second)
#         curr = datetime.strptime(str_,'%Y-%m-%d %H:%M:%S')
#         df['tmp'] = df.apply(lambda df: abs((df.lpep_pickup_datetime - curr).total_seconds()), axis = 1)
#         df[df['tmp'] >= second ]
#     return df.head()


# taxi_info = pd.read_csv('/Users/ShenJi/Downloads/yellow_tripdata_2016-06.csv')
taxi_info = pd.read_csv('/Users/ShenJi/Desktop/green_tripdata_2015-09.csv')
taxi_info.lpep_pickup_datetime = pd.to_datetime(taxi_info.lpep_pickup_datetime)
taxi_info.Lpep_dropoff_datetime = pd.to_datetime(taxi_info.Lpep_dropoff_datetime)

date1970 = datetime(1970,1,1)
input_datetime = (datetime.strptime('2015-09-10 10:19:07','%Y-%m-%d %H:%M:%S')- date1970).total_seconds()
pickup = cutDF(taxi_info, input_datetime, 40.74691009521485,-73.89108276367188, 1200, 0.0511222222)


data = [{"start_time": "","drop_time": input_datetime,"dropLat": 40.74691009521485, "dropLgn": -73.89108276367188,
"pickLat": -1, "pickLgn": -1, "surrounding":[], "total": 0}]

for i in range(21):
    pickup = cutDF(taxi_info, data[i]["drop_time"], data[i]["dropLat"], data[i]["dropLgn"], 1200, 0.3)
    next_one, center, compyt = DBSCAN(pickup)
    #print next_one
    compyt_o = [list(unit) for unit in compyt]
    data.append({"pickLat": next_one.iloc[0]['Pickup_latitude'], "pickLgn": next_one.iloc[0]['Pickup_longitude'], "dropLat": next_one.iloc[0]['Dropoff_latitude'], "dropLgn": next_one.iloc[0]['Dropoff_longitude'],
        "start_time": (next_one.iloc[0]['lpep_pickup_datetime'] - date1970).total_seconds(),"drop_time": (next_one.iloc[0]['Lpep_dropoff_datetime']-date1970).total_seconds(), "surrounding": compyt_o, "total":next_one.iloc[0]['Total_amount']})
    print i, 'done'

print data

with open('data.txt', 'w') as outfile:
    json.dump(data, outfile)






# In[101]:




# In[ ]:



