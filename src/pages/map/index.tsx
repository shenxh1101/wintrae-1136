import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/app-store';
import { spotsData } from '@/data/spots';
import { facilities } from '@/data/service';
import { routeTypes, routeSpotsMap } from '@/data/itinerary';
import { getQueueLevelText, getQueueLevelColor } from '@/utils';
import { Spot, TourSpotRecord } from '@/types';
import styles from './index.module.scss';

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

const MapPage: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('default');
  const [activeFacility, setActiveFacility] = useState('all');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const activeRouteTour = useAppStore(state => state.activeRouteTour);
  const setActiveRouteTour = useAppStore(state => state.setActiveRouteTour);
  const advanceRouteTour = useAppStore(state => state.advanceRouteTour);
  const addTourHistory = useAppStore(state => state.addTourHistory);
  const addMessage = useAppStore(state => state.addMessage);

  const isTourActive = !!activeRouteTour;
  const prevSpotIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (activeRouteTour) {
      prevSpotIndexRef.current = activeRouteTour.currentSpotIndex;
    }
  }, [activeRouteTour?.currentSpotIndex]);

  useEffect(() => {
    if (activeRouteTour && activeRouteTour.routeId !== activeRoute) {
      setActiveRoute(activeRouteTour.routeId);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTourActive) {
      timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 60000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTourActive]);

  useDidShow(() => {
    if (activeRouteTour) {
      const tourRoute = routeSpotsMap.find(r => r.routeId === activeRouteTour.routeId);
      if (tourRoute) {
        if (activeRoute !== activeRouteTour.routeId) {
          setActiveRoute(activeRouteTour.routeId);
        }
        const spots = tourRoute.spotIds
          .map(id => spotsData.find(s => s.id === id))
          .filter((s): s is Spot => !!s);
        const currentSpot = spots[activeRouteTour.currentSpotIndex] || null;
        if (currentSpot && selectedSpot?.id !== currentSpot.id) {
          setSelectedSpot(currentSpot);
        }
      }
    }
  });

  const tourStats = useMemo(() => {
    if (!activeRouteTour) return null;
    const tourRoute = routeSpotsMap.find(r => r.routeId === activeRouteTour.routeId);
    const totalSpots = tourRoute?.spotIds.length || 0;
    const startTime = new Date(activeRouteTour.startTime).getTime();
    const elapsedMs = currentTime - startTime;
    const completedCount = activeRouteTour.currentSpotIndex;
    const remainingCount = totalSpots - activeRouteTour.currentSpotIndex - 1;
    return {
      elapsed: formatDuration(elapsedMs),
      elapsedMs,
      totalSpots,
      completedCount,
      remainingCount: Math.max(0, remainingCount)
    };
  }, [activeRouteTour, currentTime]);

  const facilityTypes = [
    { id: 'all', name: '全部', icon: '📍' },
    { id: 'toilet', name: '厕所', icon: '🚻' },
    { id: 'restaurant', name: '餐饮', icon: '🍜' },
    { id: 'rest', name: '休息', icon: '🛋️' },
    { id: 'shop', name: '商店', icon: '🛍️' }
  ];

  const currentRoute = useMemo(
    () => routeSpotsMap.find(r => r.routeId === activeRoute) || routeSpotsMap[0],
    [activeRoute]
  );

  const routeSpots = useMemo(() => {
    return currentRoute.spotIds
      .map(id => spotsData.find(s => s.id === id))
      .filter((s): s is Spot => !!s);
  }, [currentRoute]);

  const tourCurrentSpot = useMemo(() => {
    if (!activeRouteTour) return null;
    const spots = routeSpotsMap
      .find(r => r.routeId === activeRouteTour.routeId)
      ?.spotIds.map(id => spotsData.find(s => s.id === id))
      .filter((s): s is Spot => !!s) || [];
    return spots[activeRouteTour.currentSpotIndex] || null;
  }, [activeRouteTour]);

  const handleRouteChange = (routeId: string) => {
    if (isTourActive && activeRouteTour) {
      Taro.showModal({
        title: '切换路线',
        content: '当前正在游览中，切换路线将结束当前游览并保存记录，确认吗？',
        confirmColor: '#2563eb',
        success: (res) => {
          if (res.confirm) {
            const nowIso = new Date().toISOString();
            const startTime = new Date(activeRouteTour.startTime).getTime();
            const totalMs = Date.now() - startTime;
            const finalSpots = activeRouteTour.spots.map((s, i) => {
              if (i === activeRouteTour.currentSpotIndex && !s.leaveTime) {
                return { ...s, leaveTime: nowIso, dwellMs: Date.now() - new Date(s.arriveTime).getTime() };
              }
              return s;
            });
            const tourRoute = routeSpotsMap.find(r => r.routeId === activeRouteTour.routeId);
            addTourHistory({
              id: 'tour-' + Date.now(),
              routeId: activeRouteTour.routeId,
              routeName: tourRoute?.name || '未知路线',
              startTime: activeRouteTour.startTime,
              endTime: nowIso,
              totalMs,
              spots: finalSpots,
              completedCount: finalSpots.filter(s => s.leaveTime).length,
              totalCount: tourRoute?.spotIds.length || 0
            });
            setActiveRouteTour(null);
            setActiveRoute(routeId);
            setSelectedSpot(null);
          }
        }
      });
      return;
    }
    setActiveRoute(routeId);
    setSelectedSpot(null);
  };

  const handleFacilityFilter = (type: string) => {
    setActiveFacility(type);
  };

  const handleSpotClick = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  const handleClosePopup = () => {
    setSelectedSpot(null);
  };

  const handleViewDetail = (spot: Spot) => {
    Taro.navigateTo({
      url: `/pages/spot-detail/index?id=${spot.id}`
    }).catch(err => console.error('[Map] 跳转详情失败:', err));
  };

  const handleAudioGuide = (spot: Spot) => {
    if (isPlayingAudio === spot.id) {
      setIsPlayingAudio(null);
      Taro.showToast({ title: '已暂停', icon: 'none' });
    } else {
      setIsPlayingAudio(spot.id);
      Taro.showToast({ title: '语音讲解播放中', icon: 'none' });
    }
  };

  const handleStartTour = () => {
    Taro.showModal({
      title: '开始游览',
      content: `即将开始「${currentRoute.name}」路线游览，共${routeSpots.length}个景点，系统会记录您的游览进度和每个景点的停留时间。`,
      confirmText: '开始',
      confirmColor: '#2563eb',
      success: (res) => {
        if (res.confirm) {
          const firstSpot = routeSpots[0];
          const nowIso = new Date().toISOString();
          const initialSpots: TourSpotRecord[] = firstSpot ? [{
            spotId: firstSpot.id,
            spotName: firstSpot.name,
            arriveTime: nowIso
          }] : [];
          setActiveRouteTour({
            routeId: activeRoute,
            currentSpotIndex: 0,
            startTime: nowIso,
            spots: initialSpots
          });
          setSelectedSpot(firstSpot || null);
          Taro.showToast({ title: '游览开始！', icon: 'success' });
        }
      }
    });
  };

  const handleNextSpot = () => {
    if (!activeRouteTour) return;
    const tourRoute = routeSpotsMap.find(r => r.routeId === activeRouteTour.routeId);
    const totalSpots = tourRoute?.spotIds.length || 0;
    if (activeRouteTour.currentSpotIndex >= totalSpots - 1) {
      Taro.showToast({ title: '已是最后一个景点', icon: 'none' });
      return;
    }
    const nowIso = new Date().toISOString();
    const updatedSpots = [...activeRouteTour.spots];
    const currentRecord = updatedSpots[activeRouteTour.currentSpotIndex];
    if (currentRecord && !currentRecord.leaveTime) {
      const arriveTime = new Date(currentRecord.arriveTime).getTime();
      currentRecord.leaveTime = nowIso;
      currentRecord.dwellMs = Date.now() - arriveTime;
    }
    advanceRouteTour();
    const nextIndex = activeRouteTour.currentSpotIndex + 1;
    const nextSpot = routeSpots[nextIndex];
    if (nextSpot && nextIndex < updatedSpots.length) {
      updatedSpots[nextIndex] = { ...updatedSpots[nextIndex], arriveTime: nowIso };
    } else if (nextSpot) {
      updatedSpots.push({
        spotId: nextSpot.id,
        spotName: nextSpot.name,
        arriveTime: nowIso
      });
    }
    setActiveRouteTour({
      ...activeRouteTour,
      currentSpotIndex: nextIndex,
      spots: updatedSpots
    });
    if (nextSpot) setSelectedSpot(nextSpot);
    Taro.showToast({ title: `前往第${nextIndex + 1}个景点`, icon: 'none' });
  };

  const handleFinishTour = () => {
    Taro.showModal({
      title: '结束游览',
      content: '确定要结束当前路线游览吗？游览记录将保存到个人中心。',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm && activeRouteTour) {
          const nowIso = new Date().toISOString();
          const startTime = new Date(activeRouteTour.startTime).getTime();
          const totalMs = Date.now() - startTime;
          const finalSpots = activeRouteTour.spots.map((s, i) => {
            if (i === activeRouteTour.currentSpotIndex && !s.leaveTime) {
              return { ...s, leaveTime: nowIso, dwellMs: Date.now() - new Date(s.arriveTime).getTime() };
            }
            return s;
          });
          const tourRoute = routeSpotsMap.find(r => r.routeId === activeRouteTour.routeId);
          const completedCount = finalSpots.filter(s => s.leaveTime).length;
          const totalCount = tourRoute?.spotIds.length || 0;

          addTourHistory({
            id: 'tour-' + Date.now(),
            routeId: activeRouteTour.routeId,
            routeName: tourRoute?.name || '未知路线',
            startTime: activeRouteTour.startTime,
            endTime: nowIso,
            totalMs,
            spots: finalSpots,
            completedCount,
            totalCount
          });

          addMessage({
            type: 'tour',
            title: '游览完成',
            desc: `「${tourRoute?.name || '路线'}」游览结束，共${completedCount}个景点，耗时${formatDuration(totalMs)}`,
            targetId: 'tour-' + Date.now(),
            targetPath: '/pages/mine/index'
          });

          setActiveRouteTour(null);
          Taro.showToast({ title: '游览已结束', icon: 'success' });
        }
      }
    });
  };

  const handleLocate = () => {
    Taro.showToast({ title: '已定位到当前位置', icon: 'none' });
  };

  const getSpotPositionStyle = (spot: Spot) => {
    return {
      left: `${spot.position.x / 8}%`,
      top: `${spot.position.y / 7}%`
    };
  };

  const getFacilityPositionStyle = (facility: typeof facilities[0]) => {
    return {
      left: `${facility.position.x / 8}%`,
      top: `${facility.position.y / 7}%`
    };
  };

  const filteredFacilities = activeFacility === 'all'
    ? facilities
    : facilities.filter(f => f.type === activeFacility);

  const isSpotCurrentTourSpot = (spotId: string) => {
    return activeRouteTour && tourCurrentSpot?.id === spotId;
  };

  const isSpotCompleted = (index: number) => {
    return activeRouteTour && activeRouteTour.routeId === activeRoute && index < activeRouteTour.currentSpotIndex;
  };

  return (
    <View className={styles.mapPage}>
      <View className={styles.mapContainer}>
        <View className={styles.routeHeader}>
          <View className={styles.routeHeaderLeft}>
            <Text className={styles.routeHeaderName}>{currentRoute.name}</Text>
            <Text className={styles.routeHeaderDesc}>
              {isTourActive && tourStats
                ? `游览中 · 已走${tourStats.elapsed} · 剩${tourStats.remainingCount}个景点`
                : currentRoute.description
              }
            </Text>
          </View>
          <View className={styles.routeHeaderStats}>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{routeSpots.length}</Text>
              <Text className={styles.routeStatLabel}>景点</Text>
            </View>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{currentRoute.estimatedTime}</Text>
              <Text className={styles.routeStatLabel}>时长</Text>
            </View>
            <View className={styles.routeStatItem}>
              <Text className={styles.routeStatValue}>{currentRoute.distance}</Text>
              <Text className={styles.routeStatLabel}>距离</Text>
            </View>
          </View>
        </View>

        <View className={styles.mapContent}>
          {routeSpots.length >= 2 && (
            <View
              className={styles.routeLineOverlay}
              style={{
                background: `linear-gradient(135deg, ${currentRoute.color}, ${currentRoute.color}88)`,
                opacity: 0.3
              }}
            />
          )}

          {routeSpots.map((spot, index) => {
            const isCurrent = isSpotCurrentTourSpot(spot.id);
            const isCompleted = isSpotCompleted(index);
            return (
              <View
                key={spot.id}
                className={classnames(styles.spotMarker, {
                  [styles.selected]: selectedSpot?.id === spot.id,
                  [styles.tourCurrent]: isCurrent,
                  [styles.tourCompleted]: isCompleted
                })}
                style={{
                  ...getSpotPositionStyle(spot),
                  backgroundColor: isCurrent ? currentRoute.color : (isCompleted ? '#00b42a' : currentRoute.color),
                  borderColor: isCurrent ? currentRoute.color : (isCompleted ? '#00b42a' : currentRoute.color)
                }}
                onClick={() => handleSpotClick(spot)}
              >
                <View className={styles.markerIndex}>
                  {isCompleted ? '✓' : (index + 1)}
                </View>
                <View className={styles.markerLabel}>{spot.name}</View>
              </View>
            );
          })}

          {filteredFacilities.map(facility => (
            <View
              key={facility.id}
              className={styles.facilityMarker}
              style={getFacilityPositionStyle(facility)}
            >
              <Text>
                {facilityTypes.find(f => f.id === facility.type)?.icon || '📍'}
              </Text>
            </View>
          ))}

          <View className={styles.currentLocation} style={{ left: '45%', top: '50%' }}>
            <View className={styles.locationDot}>
              <View className={styles.locationInner} />
            </View>
          </View>

          <View className={styles.floatingButtons}>
            <View className={styles.floatBtn} onClick={handleLocate}>
              <Text>📍</Text>
            </View>
          </View>
        </View>

        {selectedSpot && !isTourActive && (
          <View className={styles.spotPopup}>
            <View className={styles.popupHeader}>
              <Text className={styles.popupTitle}>{selectedSpot.name}</Text>
              <Text className={styles.popupClose} onClick={handleClosePopup}>✕</Text>
            </View>
            <View className={styles.popupInfo}>
              <Text className={styles.popupInfoItem}>⭐ {selectedSpot.rating}</Text>
              <Text className={styles.popupInfoItem}>
                <Text style={{ color: getQueueLevelColor(selectedSpot.queueLevel) }}>
                  ● {getQueueLevelText(selectedSpot.queueLevel)}
                </Text>
              </Text>
              <Text className={styles.popupInfoItem}>🕐 {selectedSpot.duration}</Text>
            </View>
            <View className={styles.popupActions}>
              <View
                className={classnames(styles.popupBtn, styles.popupBtnSecondary)}
                onClick={() => handleAudioGuide(selectedSpot)}
              >
                <Text>{isPlayingAudio === selectedSpot.id ? '⏸ 暂停讲解' : '🎧 语音讲解'}</Text>
              </View>
              <View
                className={classnames(styles.popupBtn, styles.popupBtnPrimary)}
                onClick={() => handleViewDetail(selectedSpot)}
              >
                <Text>查看详情</Text>
              </View>
            </View>
          </View>
        )}

        {isTourActive && tourCurrentSpot && (
          <View className={styles.tourPopup}>
            <View className={styles.tourPopupHeader}>
              <View className={styles.tourProgress}>
                <Text className={styles.tourProgressText}>
                  第{(activeRouteTour?.currentSpotIndex || 0) + 1}/{routeSpots.length}站
                  {tourStats && ` · 已走${tourStats.elapsed}`}
                </Text>
                <View className={styles.tourProgressBar}>
                  <View
                    className={styles.tourProgressFill}
                    style={{
                      width: `${((activeRouteTour?.currentSpotIndex || 0) + 1) / routeSpots.length * 100}%`,
                      backgroundColor: currentRoute.color
                    }}
                  />
                </View>
              </View>
              <Text className={styles.tourPopupClose} onClick={handleFinishTour}>结束</Text>
            </View>
            <View className={styles.tourSpotInfo}>
              <Text className={styles.tourSpotName}>{tourCurrentSpot.name}</Text>
              <Text className={styles.tourSpotMeta}>
                ⭐ {tourCurrentSpot.rating} · {tourCurrentSpot.duration}
                {tourStats && tourStats.remainingCount > 0 && ` · 剩余${tourStats.remainingCount}个景点`}
              </Text>
            </View>
            <View className={styles.tourActions}>
              <View
                className={classnames(styles.tourActionBtn, styles.tourActionSecondary)}
                onClick={() => handleAudioGuide(tourCurrentSpot)}
              >
                <Text>{isPlayingAudio === tourCurrentSpot.id ? '⏸ 暂停' : '🎧 讲解'}</Text>
              </View>
              <View
                className={classnames(styles.tourActionBtn, styles.tourActionSecondary)}
                onClick={() => handleViewDetail(tourCurrentSpot)}
              >
                <Text>详情</Text>
              </View>
              {(activeRouteTour?.currentSpotIndex || 0) < routeSpots.length - 1 && (
                <View
                  className={classnames(styles.tourActionBtn, styles.tourActionPrimary)}
                  style={{ backgroundColor: currentRoute.color }}
                  onClick={handleNextSpot}
                >
                  <Text>下一站 ›</Text>
                </View>
              )}
              {(activeRouteTour?.currentSpotIndex || 0) >= routeSpots.length - 1 && (
                <View
                  className={classnames(styles.tourActionBtn, styles.tourActionFinish)}
                  onClick={handleFinishTour}
                >
                  <Text>完成游览 ✓</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View className={styles.bottomPanel}>
          <View className={styles.routeTabs}>
            {routeTypes.map(route => (
              <View
                key={route.id}
                className={classnames(styles.routeTab, {
                  [styles.active]: activeRoute === route.id
                })}
                style={activeRoute === route.id ? {
                  backgroundColor: (routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb') + '15',
                  color: routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb',
                  borderColor: routeSpotsMap.find(r => r.routeId === route.id)?.color || '#2563eb'
                } : {}}
                onClick={() => handleRouteChange(route.id)}
              >
                <Text>{route.name}</Text>
              </View>
            ))}
          </View>

          <View className={styles.facilityFilter}>
            {facilityTypes.map(item => (
              <View
                key={item.id}
                className={classnames(styles.facilityItem, {
                  [styles.active]: activeFacility === item.id
                })}
                onClick={() => handleFacilityFilter(item.id)}
              >
                <Text className={styles.facilityIcon}>{item.icon}</Text>
                <Text className={styles.facilityName}>{item.name}</Text>
              </View>
            ))}
          </View>

          {!isTourActive && (
            <View className={styles.tourStartBar}>
              <View className={styles.tourStartInfo}>
                <Text className={styles.tourStartRoute}>{currentRoute.name}</Text>
                <Text className={styles.tourStartDesc}>{routeSpots.length}个景点 · {currentRoute.estimatedTime}</Text>
              </View>
              <View
                className={styles.tourStartBtn}
                style={{ backgroundColor: currentRoute.color }}
                onClick={handleStartTour}
              >
                <Text>开始游览</Text>
              </View>
            </View>
          )}

          <View className={styles.routeSpotsList}>
            <Text className={styles.routeSpotsTitle}>
              路线景点（{routeSpots.length}个）
              {isTourActive && tourStats && ` · 已走${tourStats.elapsed} · 剩${tourStats.remainingCount}个`}
            </Text>
            <View className={styles.routeSpotsScroll}>
              {routeSpots.map((spot, index) => {
                const isCurrentTourSpot = isSpotCurrentTourSpot(spot.id);
                const isCompletedSpot = isSpotCompleted(index);
                return (
                  <View
                    key={spot.id}
                    className={classnames(styles.routeSpotItem, {
                      [styles.selected]: selectedSpot?.id === spot.id,
                      [styles.tourCurrentItem]: isCurrentTourSpot,
                      [styles.tourCompletedItem]: isCompletedSpot
                    })}
                    onClick={() => handleSpotClick(spot)}
                  >
                    <View
                      className={classnames(styles.routeSpotIndex, {
                        [styles.indexCompleted]: isCompletedSpot
                      })}
                      style={{ backgroundColor: isCompletedSpot ? '#00b42a' : (isCurrentTourSpot ? currentRoute.color : undefined) }}
                    >
                      <Text>{isCompletedSpot ? '✓' : (index + 1)}</Text>
                    </View>
                    <View className={styles.routeSpotInfo}>
                      <Text className={styles.routeSpotName}>{spot.name}</Text>
                      <Text className={styles.routeSpotDesc}>
                        ⭐{spot.rating} · {spot.duration}
                      </Text>
                    </View>
                    <View className={styles.routeSpotActions}>
                      <View
                        className={styles.routeSpotAction}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAudioGuide(spot);
                        }}
                      >
                        <Text>{isPlayingAudio === spot.id ? '⏸' : '🎧'}</Text>
                      </View>
                      <View
                        className={styles.routeSpotAction}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(spot);
                        }}
                      >
                        <Text>›</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MapPage;
