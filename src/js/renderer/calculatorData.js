export default {
  '1': {
    timer: 0,
    input: {
      itemNumber: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      currentPt: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      targetPt: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      commonTimes: {
        type: 'radio',
        model: '1',
        option: [{
          id: 'act1',
          text: '1倍',
          value: '1'
        }, {
          id: 'act2',
          text: '2倍',
          value: '2'
        }]
      },
      commonDifficulty: {
        type: 'radio',
        model: '19 53 63',
        option: [
          {
            id: 'acdD',
            text: 'D',
            value: '11 28 42'
          },
          {
            id: 'acdR',
            text: 'R',
            value: '14 37 49'
          },
          {
            id: 'acdP',
            text: 'P',
            value: '17 47 56'
          },
          {
            id: 'acdM',
            text: 'M',
            value: '19 53 63'
          }
        ]
      },
      eventTimes: {
        type: 'radio',
        model: '1',
        option: [
          {
            id: 'aet1',
            text: '1倍',
            value: '1'
          },
          {
            id: 'aet2',
            text: '2倍',
            value: '2'
          },
          {
            id: 'aet4',
            text: '4倍',
            value: '4'
          }
        ]
      },
      eventDifficulty: {
        type: 'radio',
        model: '150 320 63',
        option: [
          {
            id: 'aedD',
            text: 'D',
            value: '75 130 42'
          },
          {
            id: 'aedR',
            text: 'R',
            value: '90 170 49'
          },
          {
            id: 'aedP',
            text: 'P',
            value: '120 240 56'
          },
          {
            id: 'aedM',
            text: 'M',
            value: '150 320 63'
          },
          {
            id: 'aedM+',
            text: 'M+',
            value: '150 320 70'
          }
        ]
      }
    },
    output: {
      levelUp: 0,
      requirePt: 0,
      commonLiveTimes: 0,
      eventLiveTimes: 0,
      bonusItem: 0,
      requireItem: 0,
      requireStamina: 0,
      gameTime: '00:00',
      extraStamina: 0
    }
  },
  '2': {
    timer: 0,
    input: {
      currentMedal: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      targetMedal: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      starRank: {
        type: 'text',
        limit: [1, 20],
        model: '15'
      },
      commonDifficulty: {
        type: 'radio',
        model: '19 24 1.0 63',
        option: [
          {
            id: 'ccdR',
            text: 'R',
            value: '13 15 0.6 49'
          },
          {
            id: 'ccdP',
            text: 'P',
            value: '16 20 0.7 56'
          },
          {
            id: 'ccdM',
            text: 'M',
            value: '19 24 1.0 63'
          }
        ]
      }
    },
    output: {
      levelUp: 0,
      extraRewardOdds: '0/0/0/0/0',
      cardRewardOdds: '0/0',
      averageMedal: 0,
      requireMedal: 0,
      commonLiveTimes: 0,
      bonusStamina: 0,
      requireStamina: 0,
      gameTime: '00:00',
      extraStamina: 0
    }
  },
  '3': {
    timer: 0,
    input: {
      currentPt: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      targetPt: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      eventDifficulty: {
        type: 'radio',
        model: '4 50 114 180',
        option: [
          {
            id: 'medD',
            text: 'D',
            value: '0 20 32 117'
          },
          {
            id: 'medR',
            text: 'R',
            value: '1 30 53 141'
          },
          {
            id: 'medP',
            text: 'P',
            value: '2 40 76 159'
          },
          {
            id: 'medM',
            text: 'M',
            value: '3 50 103 180'
          },
          {
            id: 'medM+',
            text: 'M+',
            value: '4 50 114 180'
          }
        ]
      },
      hakoyureLevel: {
        type: 'radio',
        model: '144 239 343 461 461',
        option: [
          /* {
            id: 'mhl0',
            text: '0',
            value: '119 192 279 379 379'
          }, */
          {
            id: 'mhl20',
            text: '20',
            value: '127 208 301 407 407'
          },
          {
            id: 'mhl30',
            text: '30',
            value: '134 221 320 432 432'
          },
          {
            id: 'mhl40',
            text: '40',
            value: '140 233 335 451 451'
          },
          {
            id: 'mhl50',
            text: '50',
            value: '144 239 343 461 461'
          }
        ]
      }
    },
    output: {
      levelUp: 0,
      requirePt: 0,
      eventLiveTimes: 0,
      bonusStamina: 0,
      requireStamina: 0,
      gameTime: '00:00',
      extraStamina: 0
    }
  },
  '5': {
    timer: 0,
    input: {
      currentAudience: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      targetAudience: {
        type: 'text',
        limit: [0, Infinity],
        model: '0'
      },
      areaStamina: {
        type: 'radio',
        model: '50 3 22000 179',
        option: [
          {
            id: 'tas10',
            text: '10',
            value: '10 1 3400 32'
          },
          {
            id: 'tas15',
            text: '15',
            value: '15 1 5600 53'
          },
          {
            id: 'tas20',
            text: '20',
            value: '20 1 8000 74'
          },
          {
            id: 'tas25',
            text: '25',
            value: '25 2 8900 85'
          },
          {
            id: 'tas30',
            text: '30',
            value: '30 2 11700 106'
          },
          {
            id: 'tas35',
            text: '35',
            value: '35 2 14700 126'
          },
          {
            id: 'tas40',
            text: '40',
            value: '40 3 14900 139'
          },
          {
            id: 'tas45',
            text: '45',
            value: '45 3 18400 160'
          },
          {
            id: 'tas50',
            text: '50',
            value: '50 3 22000 179'
          }
        ]
      },
      liveOption: {
        type: 'radio',
        model: '0',
        option: [
          {
            id: 'tlo1',
            text: 'smoke',
            value: '0.03'
          },
          {
            id: 'tlo3',
            text: 'firework',
            value: '0.1'
          },
          {
            id: 'tlo2',
            text: 'laser',
            value: '0.05'
          },
          {
            id: 'tlo0',
            text: '無し',
            value: '0'
          }
        ]
      }
    },
    output: {
      levelUp: 0,
      requireAudience: 0,
      eventLiveTimes: 0,
      bonusStamina: 0,
      requireStamina: 0,
      gameTime: '00:00',
      extraStamina: 0
    }
  }
}
