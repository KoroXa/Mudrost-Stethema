import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated,
  Dimensions, Easing, SafeAreaView, Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const CITY_HEIGHT = 110;
const PVA_BASE_COST = 50;
const PVA_INCREMENT = 25;
const PVA_COOLDOWN = 2500;
const PVA_MISS_CHANCE = 0.3;
const PVA_MIN_DISTANCE = 60;
const NORMAL_REWARD = 15;
const GERAN_REWARD = 40;
const ATTACKER_REWARD = 50;
const ATTACKER_INTERVAL = 12000;

const SKY_COLORS = {
  morning: ['#ff9a9e', '#fecfef', '#fbc2eb', '#a6c1ee'],
  day:     ['#2980b9', '#6dd5fa', '#ffffff', '#f0f8ff'],
  sunset:  ['#2b1055', '#7597de', '#ff7b54', '#ffb26b'],
  night:   ['#060a1a', '#1a1535', '#3d1a3d', '#7a2030'],
};

const STARS = Array.from({ length: 55 }, () => ({
  x: Math.random() * width,
  y: Math.random() * (height - CITY_HEIGHT) * 0.65,
  size: 1 + Math.random() * 1.5,
  opacity: 0.3 + Math.random() * 0.6,
}));

const BUILDINGS = Array.from({ length: 16 }, () => {
  const winCount = 3 + Math.floor(Math.random() * 9);
  return {
    height: 30 + Math.random() * 70,
    windows: Array.from({ length: winCount }, () => ({
      x: Math.random(), y: Math.random(), lit: Math.random() > 0.35,
    })),
  };
});

// ─── КОМПОНЕНТ ФЕЙКОВОГО УВЕДОМЛЕНИЯ ───────────────────────
function FakeTelegramNotification({ visible, count, onDismiss }) {
  const translateY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (visible) {
      // Выезжаем сверху
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    } else {
      // Уезжаем обратно
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.notificationContainer, { transform: [{ translateY }] }]}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onDismiss} style={styles.notificationContent}>
        {/* Шапка уведомления */}
        <View style={styles.notificationHeader}>
          <View style={styles.telegramIcon}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✈️</Text>
          </View>
          <Text style={styles.appName}>TELEGRAM</Text>
          <Text style={styles.timeLabel}>сейчас</Text>
        </View>
        {/* Тело уведомления */}
        <View style={styles.notificationBody}>
          <Text style={styles.senderName}>Собянин С.С.</Text>
          <Text style={styles.messageText}>
            За прошедшую ночь силами ПВО сбито <Text style={{fontWeight: 'bold', color: '#D52B1E'}}>{count}</Text> дронов. Город под надежной защитой. Начинаем новый день! 🌅
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── ВИЗУАЛ ДРОНОВ ───────────────────────────────────────
function DroneVisual({ size, kind }) {
  if (kind === 'geran') {
    return (
      <Image
        source={require('./assets/geran.png')}
        style={{
          width: size * 1.2,
          height: size * 1.2,
          resizeMode: 'contain',
          transform: [{ rotate: '90deg' }],
        }}
      />
    );
  }

  const rotorSize = size * 0.32;
  const bodyColor = kind === 'attacker' ? '#6b1010' : '#333';
  const borderColor = kind === 'attacker' ? '#ff3b30' : '#aaa';
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: size, marginTop: size * 0.2 }}>
        <View style={{ width: rotorSize, height: 3, backgroundColor: borderColor, borderRadius: 1.5 }} />
        <View style={{ width: rotorSize, height: 3, backgroundColor: borderColor, borderRadius: 1.5 }} />
      </View>
      <View style={{
        width: size * 0.5, height: size * 0.28,
        backgroundColor: bodyColor, borderWidth: 1.5, borderColor,
        borderRadius: 3, marginTop: -1,
      }} />
      <View style={{ position: 'absolute', bottom: size * 0.22, width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255, 59, 48, 0.4)' }} />
      <View style={{ position: 'absolute', bottom: size * 0.25, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF3B30' }} />
    </View>
  );
}

// ─── ДРОН ────────────────────────────────────────────────
function Drone({ drone, onKilled, onMissed, onAttackerHit }) {
  const x = useRef(new Animated.Value(drone.posRef.current.x)).current;
  const y = useRef(new Animated.Value(drone.y)).current;
  const mounted = useRef(true);

  useEffect(() => {
    const xListener = x.addListener(({ value }) => { drone.posRef.current.x = value; });
    const yListener = y.addListener(({ value }) => { drone.posRef.current.y = value; });

    if (drone.kind === 'attacker') {
      Animated.timing(y, {
        toValue: drone.targetY,
        duration: drone.duration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted.current) onAttackerHit(drone.id, drone.targetPvaId);
      });
    } else {
      Animated.timing(x, {
        toValue: width + 10,
        duration: drone.duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted.current) onMissed(drone.id);
      });
    }

    return () => {
      mounted.current = false;
      x.removeListener(xListener);
      y.removeListener(yListener);
    };
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, transform: [{ translateX: x }, { translateY: y }] }}>
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => onKilled(drone.id)}
        style={{ padding: 20, margin: -20 }}
      >
        <DroneVisual size={drone.size} kind={drone.kind} />
      </View>
    </Animated.View>
  );
}

function PvaVisual() {
  return (
    <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', top: 5, right: 14, width: 6, height: 22, backgroundColor: '#666', borderRadius: 3, transform: [{ rotate: '-20deg' }] }} />
      <View style={{ width: 40, height: 22, backgroundColor: '#3a3a4a', borderRadius: 5, borderWidth: 1.5, borderColor: '#7a7a8a' }} />
      <View style={{ width: 50, height: 12, backgroundColor: '#2a2a3a', borderRadius: 3, marginTop: 2, borderWidth: 1, borderColor: '#555' }} />
      <View style={{ position: 'absolute', top: 26, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4ECDC4' }} />
    </View>
  );
}

function Missile({ missile, onArrive }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1, duration: 450, easing: Easing.linear, useNativeDriver: true,
    }).start(() => onArrive(missile.id));
  }, []);

  const dx = missile.to.x - missile.from.x;
  const dy = missile.to.y - missile.from.y;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: missile.from.x - 5, top: missile.from.y - 5,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: missile.willHit ? '#ff9a3c' : '#888',
      shadowColor: missile.willHit ? '#ff6b35' : '#666',
      shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6,
      transform: [{ translateX }, { translateY }],
    }} />
  );
}

function Explosion({ x, y, onDone }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 2.2, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - 30, top: y - 30,
      width: 60, height: 60, alignItems: 'center', justifyContent: 'center',
      opacity, transform: [{ scale }],
    }}>
      <Text style={{ fontSize: 50 }}>💥</Text>
    </Animated.View>
  );
}

function MissText({ x, y, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -40, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.Text pointerEvents="none" style={{
      position: 'absolute', left: x - 25, top: y - 10,
      color: '#ff6b6b', fontWeight: '900', fontSize: 16, letterSpacing: 1,
      opacity, transform: [{ translateY }],
      textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
    }}>
      ПРОМАХ
    </Animated.Text>
  );
}

function MoneyPopup({ x, y, amount, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -50, duration: 900, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.Text pointerEvents="none" style={{
      position: 'absolute', left: x, top: y,
      color: '#FFDB4D', fontWeight: '900', fontSize: 22,
      opacity, transform: [{ translateY }],
      textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
    }}>
      +{amount}💰
    </Animated.Text>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ───────────────────────────────────
export default function App() {
  const [drones, setDrones] = useState([]);
  const [pvas, setPvas] = useState([]);
  const [missiles, setMissiles] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [moneyPopups, setMoneyPopups] = useState([]);
  const [missTexts, setMissTexts] = useState([]);
  
  const [killed, setKilled] = useState(0);
  const [missed, setMissed] = useState(0);
  const [money, setMoney] = useState(0);
  
  // Состояние времени суток
  const [timeOfDay, setTimeOfDay] = useState('night');
  const timeOfDayRef = useRef('night');
  
  // Состояние уведомления
  const [notification, setNotification] = useState({ visible: false, count: 0 });

  const dronesRef = useRef([]);
  const pvasRef = useRef([]);
  const missilesRef = useRef([]);
  const lockedTargetsRef = useRef(new Set());
  const killedRef = useRef(0);
  
  const gameStartTime = useRef(Date.now());
  const lastSpawnRef = useRef(Date.now());
  const droneCountRef = useRef(0);

  useEffect(() => { dronesRef.current = drones; }, [drones]);
  useEffect(() => { pvasRef.current = pvas; }, [pvas]);
  useEffect(() => { missilesRef.current = missiles; }, [missiles]);
  useEffect(() => { timeOfDayRef.current = timeOfDay; }, [timeOfDay]);
  useEffect(() => { killedRef.current = killed; }, [killed]);

  const nextPvaCost = PVA_BASE_COST + pvas.length * PVA_INCREMENT;

  // ─── СМЕНА ДНЯ И НОЧИ (С УВЕДОМЛЕНИЕМ) ───
  useEffect(() => {
    const phases = [
      { name: 'morning', duration: 10000 },
      { name: 'day', duration: 10000 },
      { name: 'sunset', duration: 10000 },
      { name: 'night', duration: 60000 },
    ];
    let phaseIndex = 3;
    let timer;

    const runCycle = () => {
      timer = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        const newPhase = phases[phaseIndex].name;
        
        // Если наступает УТРО:
        if (newPhase === 'morning') {
          // Показываем уведомление с текущим счетчиком (перед обнулением)
          setNotification({ visible: true, count: killedRef.current });
          // Обнуляем счетчик
          setKilled(0);
          
          // Автоматически скрываем уведомление через 5 секунд
          setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
          }, 5000);
        }

        setTimeOfDay(newPhase);
        runCycle();
      }, phases[phaseIndex].duration);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, []);

  // ─── СПАВН (Зависит от времени суток) ───
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - gameStartTime.current;
      const tod = timeOfDayRef.current;

      let baseInterval = 300;
      if (tod === 'day') baseInterval = 1800;
      else if (tod === 'morning' || tod === 'sunset') baseInterval = 800;

      const currentInterval = Math.max(baseInterval * 0.3, baseInterval - Math.floor(elapsed / 15000) * (baseInterval * 0.05));
      
      if (Date.now() - lastSpawnRef.current >= currentInterval) {
        lastSpawnRef.current = Date.now();
        droneCountRef.current += 1;
        const isGeran = droneCountRef.current % 10 === 0;
        
        const size = isGeran ? 45 : 42 + Math.random() * 20;
        const yPos = 100 + Math.random() * (height - CITY_HEIGHT - 220);
        
        setDrones(prev => [...prev, {
          id: `${isGeran ? 'g' : 'n'}-${Date.now()}-${Math.random()}`,
          kind: isGeran ? 'geran' : 'normal',
          y: yPos,
          size,
          duration: isGeran ? 3000 : 5500 + Math.random() * 2500,
          posRef: { current: { x: -size - 20, y: yPos } },
        }]);
      }
    }, 50);
    return () => clearInterval(tick);
  }, []);

  // ─── КАМИКАДЗЕ ───
  useEffect(() => {
    const spawnAttacker = () => {
      const currentPvas = pvasRef.current;
      if (currentPvas.length === 0) return;
      
      const elapsed = Date.now() - gameStartTime.current;
      const speedUp = Math.floor(elapsed / 10000) * 300;
      const attackerDuration = Math.max(1500, 3500 - speedUp);

      const target = currentPvas[Math.floor(Math.random() * currentPvas.length)];
      const size = 50;
      const startX = target.x + 30 - size / 2;
      
      setDrones(prev => [...prev, {
        id: `a-${Date.now()}-${Math.random()}`,
        kind: 'attacker',
        y: -70,
        size,
        duration: attackerDuration,
        targetPvaId: target.id,
        targetY: height - 50,
        posRef: { current: { x: startX, y: -70 } },
      }]);
    };
    const i = setInterval(spawnAttacker, ATTACKER_INTERVAL);
    return () => clearInterval(i);
  }, []);

  // ─── ПВО ───
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentDrones = dronesRef.current;

      const existingIds = new Set(currentDrones.map(d => d.id));
      Array.from(lockedTargetsRef.current).forEach(id => {
        if (!existingIds.has(id)) lockedTargetsRef.current.delete(id);
      });

      pvasRef.current.forEach(pva => {
        if (now - pva.lastFired < PVA_COOLDOWN) return;

        const targets = currentDrones.filter(d =>
          (d.kind === 'normal' || d.kind === 'geran')
          && d.posRef.current.y > 50
          && d.posRef.current.x > 0
          && !lockedTargetsRef.current.has(d.id)
        );
        
        const target = targets[0];
        if (!target) return;

        pva.lastFired = now;
        lockedTargetsRef.current.add(target.id);

        const willHit = Math.random() > PVA_MISS_CHANCE;

        setPvas(prev => prev.map(p => p.id === pva.id ? { ...p, lastFired: now } : p));
        setMissiles(prev => [...prev, {
          id: `m-${Date.now()}-${Math.random()}`,
          from: { x: pva.x + 30, y: height - 50 },
          to: { x: target.posRef.current.x + target.size / 2, y: target.posRef.current.y + target.size / 2 },
          targetId: target.id,
          willHit,
        }]);
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const killDrone = (droneId, sourcePos) => {
    const drone = dronesRef.current.find(d => d.id === droneId);
    if (!drone) return;
    
    const reward = drone.kind === 'attacker' ? ATTACKER_REWARD : drone.kind === 'geran' ? GERAN_REWARD : NORMAL_REWARD;
    const ex = sourcePos?.x ?? drone.posRef.current.x + drone.size / 2;
    const ey = sourcePos?.y ?? drone.posRef.current.y + drone.size / 2;

    setDrones(prev => prev.filter(d => d.id !== droneId));
    setKilled(k => k + 1);
    setMoney(m => m + reward);
    setExplosions(prev => [...prev, { id: `e-${Date.now()}-${Math.random()}`, x: ex, y: ey }]);
    setMoneyPopups(prev => [...prev, { id: `mp-${Date.now()}-${Math.random()}`, x: ex, y: ey, amount: reward }]);
  };

  const handleDroneTap = (droneId) => {
    killDrone(droneId);
  };

  const handleMissed = (droneId) => {
    setDrones(prev => prev.filter(d => d.id !== droneId));
    setMissed(m => m + 1);
  };

  const handleMissileArrive = (missileId) => {
    const missile = missilesRef.current.find(m => m.id === missileId);
    if (!missile) return;
    lockedTargetsRef.current.delete(missile.targetId);
    setMissiles(prev => prev.filter(m => m.id !== missileId));

    if (missile.willHit) {
      killDrone(missile.targetId);
    } else {
      const offX = (Math.random() - 0.5) * 50;
      const offY = (Math.random() - 0.5) * 50;
      setExplosions(prev => [...prev, {
        id: `e-${Date.now()}-${Math.random()}`,
        x: missile.to.x + offX,
        y: missile.to.y + offY,
      }]);
      setMissTexts(prev => [...prev, {
        id: `mt-${Date.now()}-${Math.random()}`,
        x: missile.to.x, y: missile.to.y,
      }]);
    }
  };

  const handleAttackerHit = (droneId, pvaId) => {
    const pva = pvasRef.current.find(p => p.id === pvaId);
    if (pva) {
      setExplosions(prev => [...prev, {
        id: `e-${Date.now()}-${Math.random()}`,
        x: pva.x + 30, y: height - 50,
      }]);
    }
    setDrones(prev => prev.filter(d => d.id !== droneId));
    setPvas(prev => prev.filter(p => p.id !== pvaId));
    lockedTargetsRef.current.delete(droneId);
  };

  const buyPva = () => {
    if (money < nextPvaCost) return;
    setMoney(m => m - nextPvaCost);
    setPvas(prev => {
      const existingXs = prev.map(p => p.x);
      let x = 40 + Math.random() * (width - 160);
      for (let attempt = 0; attempt < 40; attempt++) {
        if (existingXs.every(ex => Math.abs(ex - x) >= PVA_MIN_DISTANCE)) break;
        x = 40 + Math.random() * (width - 160);
      }
      return [...prev, {
        id: `pva-${Date.now()}-${Math.random()}`,
        x,
        lastFired: 0,
      }];
    });
  };

  const skyColors = SKY_COLORS[timeOfDay];
  const isNight = timeOfDay === 'night';

  return (
    <View style={styles.container}>
      <StatusBar style={isNight ? "light" : "dark"} />

      {/* ФОН */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 3, backgroundColor: skyColors[0] }} />
        <View style={{ flex: 2, backgroundColor: skyColors[1] }} />
        <View style={{ flex: 1.5, backgroundColor: skyColors[2] }} />
        <View style={{ flex: 0.8, backgroundColor: skyColors[3] }} />
      </View>

      {/* ЗВЁЗДЫ */}
      {isNight && STARS.map((s, i) => (
        <View key={`s-${i}`} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          backgroundColor: '#fff', opacity: s.opacity,
        }} />
      ))}

      {/* СОЛНЦЕ / ЛУНА */}
      {isNight ? (
        <>
          <View style={{ position: 'absolute', top: 110, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245, 240, 224, 0.15)' }} />
          <View style={{ position: 'absolute', top: 120, right: 40, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f0e0' }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', top: 110, right: 30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 223, 0, 0.3)' }} />
          <View style={{ position: 'absolute', top: 120, right: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFDF00' }} />
        </>
      )}

      {/* ДРОНЫ */}
      {drones.map(d => (
        <Drone key={d.id} drone={d} onKilled={handleDroneTap} onMissed={handleMissed} onAttackerHit={handleAttackerHit} />
      ))}
      {missiles.map(m => (
        <Missile key={m.id} missile={m} onArrive={handleMissileArrive} />
      ))}

      {/* ГОРОД */}
      <View style={styles.city}>
        {BUILDINGS.map((b, i) => (
          <View key={`b-${i}`} style={[styles.building, { height: b.height }]}>
            {b.windows.map((w, wi) => (
              <View key={wi} style={{
                position: 'absolute',
                left: `${w.x * 70 + 15}%`, top: `${w.y * 70 + 15}%`,
                width: 3, height: 4,
                backgroundColor: (w.lit && isNight) ? '#ffdb4d' : '#1a1a1a',
              }} />
            ))}
          </View>
        ))}
      </View>

      {/* ПВО */}
      {pvas.map(pva => (
        <View key={pva.id} style={{ position: 'absolute', bottom: 20, left: pva.x }}>
          <PvaVisual />
        </View>
      ))}

      {/* ЭФФЕКТЫ */}
      {explosions.map(e => (
        <Explosion key={e.id} x={e.x} y={e.y} onDone={() => setExplosions(prev => prev.filter(x => x.id !== e.id))} />
      ))}
      {missTexts.map(mt => (
        <MissText key={mt.id} x={mt.x} y={mt.y} onDone={() => setMissTexts(prev => prev.filter(x => x.id !== mt.id))} />
      ))}
      {moneyPopups.map(mp => (
        <MoneyPopup key={mp.id} x={mp.x} y={mp.y} amount={mp.amount} onDone={() => setMoneyPopups(prev => prev.filter(x => x.id !== mp.id))} />
      ))}

      {/* ИНТЕРФЕЙС */}
      {killed < 3 && (
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>Тапай по дронам — получай 💰 на ПВО!</Text>
        </View>
      )}

      <SafeAreaView style={styles.hud} pointerEvents="box-none">
        <View style={styles.hudRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statLabel}>СБИТО</Text>
            <Text style={styles.statValue}>{killed}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statLabel}>УШЛО</Text>
            <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{missed}</Text>
          </View>
          <View style={[styles.statBadge, styles.moneyBadge]}>
            <Text style={styles.statLabel}>💰</Text>
            <Text style={[styles.statValue, { color: '#FFDB4D' }]}>{money}</Text>
          </View>
        </View>
        
        <View style={styles.timeIndicator}>
          <Text style={styles.timeText}>
            {timeOfDay === 'morning' ? '🌅 УТРО' : timeOfDay === 'day' ? '☀️ ДЕНЬ' : timeOfDay === 'sunset' ? '🌇 ЗАКАТ' : '🌙 НОЧЬ'}
          </Text>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={[styles.buyFab, money < nextPvaCost && styles.buyFabDisabled]}
        onPress={buyPva}
        disabled={money < nextPvaCost}
        activeOpacity={0.7}
      >
        <Text style={styles.buyFabIcon}>+</Text>
        <Text style={styles.buyFabLabel}>ПВО</Text>
        <Text style={styles.buyFabCost}>💰{nextPvaCost}</Text>
      </TouchableOpacity>

      {/* ФЕЙКОВОЕ УВЕДОМЛЕНИЕ (Всегда поверх всего) */}
      <FakeTelegramNotification
        visible={notification.visible}
        count={notification.count}
        onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060a1a' },
  city: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: CITY_HEIGHT, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#0a0a14',
  },
  building: {
    flex: 1, backgroundColor: '#0e0e1a', marginHorizontal: 1,
    borderTopWidth: 1, borderTopColor: '#1a1a2a',
  },
  hud: { position: 'absolute', top: 0, left: 0, right: 0 },
  hudRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 8, gap: 6,
  },
  statBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, alignItems: 'center',
    minWidth: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  moneyBadge: { borderColor: 'rgba(255, 219, 77, 0.5)' },
  statLabel: { color: '#aaa', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  statValue: { color: '#FFDB4D', fontSize: 22, fontWeight: '900', lineHeight: 26 },
  timeIndicator: {
    alignSelf: 'center', marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10,
  },
  timeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  hint: { position: 'absolute', bottom: CITY_HEIGHT + 20, left: 0, right: 0, alignItems: 'center' },
  hintText: {
    color: '#fff', fontSize: 13, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, overflow: 'hidden',
  },
  buyFab: {
    position: 'absolute', bottom: CITY_HEIGHT + 20, right: 16,
    backgroundColor: '#D52B1E',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: '#FFDB4D',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
    minWidth: 80,
  },
  buyFabDisabled: { backgroundColor: '#3a2a2a', borderColor: '#555', opacity: 0.6 },
  buyFabIcon: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 22 },
  buyFabLabel: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  buyFabCost: { color: '#FFDB4D', fontSize: 13, fontWeight: '900', marginTop: 2 },
  
  // Стили для фейкового уведомления
  notificationContainer: {
    position: 'absolute',
    top: 50, // Отступ сверху (под чёлкой)
    left: 10,
    right: 10,
    backgroundColor: 'rgba(250, 250, 250, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 9999,
  },
  notificationContent: {
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  telegramIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2AABEE', // Цвет телеграма
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
  },
  notificationBody: {
    paddingLeft: 30, // Выравнивание под текст
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
});