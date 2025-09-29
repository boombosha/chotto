import tatianaImg from '../data/images/image1.png'

export const chats = [
  {
    chatId: 1, name: "Василий ВасилийВасилийВасилий Василий",
    avatar: 'https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg',
    countUnread: 102,
    lastMessage: 'Длинное сообщение сомнительного характера в контексте размещения на малой строке',
    'lastActivity.time': 'час назад',         // читаемый формат - для пользователей
    'lastActivity.timestamp': '1727001759',   // для сортировки
    isFixedBottom: false,
    status: "#767676",
    'lastMessage.status': 'read',
    actions: [
      { action: 'addDialog', title: 'новый диалог', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=add' },
      { action: 'edit', title: 'изменить', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=pin' },
      { action: 'delete', title: 'удалить', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=del' },
    ],
    typing: true,
    metadata: '',    // фильтр работает по name и данным в metadata
    dialogsExpanded: true,
    dialogs: [
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_43543555',
        attributeId: 'atr_1',
        channelId: 'whatsapp.W1243',
        icon: 'https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg',
        name: 'диалог1 79135292926',
        fullname: 'диалог1 номер 79135292926 канал whatsapp 73910001100 (основной)',   // для tooltip'а
        countUnread: 10,
        'lastActivity.time': 'час назад',  
        'lastActivity.timestamp': 1757318879000,   // для сортировки
        isSelected: false,
      },
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_89789879',
        attributeId: 'atr_2',
        channelId: 'whatsapp.W1243',
        icon: 'https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg',
        name: 'диалог2 7913529XXXX',
        fullname: 'диалог2 номер 7913529XX27 канал whatsapp 73910001100 (основной)',
        countUnread: 90,
        'lastActivity.time': '8 months ago',
        'lastActivity.timestamp': 1737014959111,   // для сортировки
        isSelected: false,
      },
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_17431847',
        attributeId: 'atr_2',
        channelId: 'whatsapp.W5432',
        icon: 'https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg',
        name: 'диалог3 7913529XXXX whatsapp.W5432',
        fullname: 'диалог3 7913529XXXX whatsapp.W5432',
        countUnread: 90,
        'lastActivity.time': 'a year ago',
        'lastActivity.timestamp': 1727006459111,   // для сортировки
        isSelected: false,
      },
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_00123981',
        attributeId: 'atr_2',
        channelId: 'waba.WABA7534',
        name: 'диалог4 7913529XXXX waba.WABA7534',
        fullname: 'диалог4 7913529XXXX waba.WABA7534',
        countUnread: 90,
        'lastActivity.time': 'a year ago',
        'lastActivity.timestamp': 1727131759111,   // для сортировки
        isSelected: false,
      },
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_89460153',
        attributeId: 'atr_3',
        channelId: 'telegram.T6432',
        name: 'диалог5 telegram @antirek (telegram)',
        fullname: 'диалог5 telegram @antirek (telegram)',
        countUnread: 90,
        'lastActivity.time': 'a year ago',
        'lastActivity.timestamp': 1727641759111,   // для сортировки
        isSelected: false,
      },
      { 
        branchId: 'bch_1',
        dialogId: 'dlg_71053061',
        attributeId: 'atr_3',
        channelId: 'telegrambot.TGB5431',
        name: 'диалог6 telegram @antirek (telegrambot)',
        fullname: 'диалог6 telegram @antirek (telegrambot)',
        countUnread: 90,
        'lastActivity.time': 'a year ago',
        'lastActivity.timestamp': 1727001759123,   // для сортировки
        isSelected: false,
      },
      {
        dialogId: 'all',
        name: 'Просмотр всех диалогов',
        'lastActivity.timestamp': 17270000000,   // для сортировки
        countUnread: 100,
        isSelected: false,
      }
    ],
    contact: {
      // Структуру атрибутов контакта можно пока оставить без изменений,
      // но стоит учитывать, что поле id может не содержать содержательной информации (тип или номер телефона, как в примерах ниже).
      // К примеру, поле id может быть равно atr_1, atr_adsafg и т.д. 
      attributes: [
        {
          id: 'atr_1',
          type: 'phone',
          data: '79135292926',
          value: 'whatsapp 79135292926',
        },
        {
          id: 'atr_2',
          type: 'phone',
          data: '7913529XXXX',
          value: 'whatsapp 7913529XXXX',
        },
        {
          id: 'atr_3',
          type: 'telegram',
          data: {
            id: '182940012993',
            nickname: 'test_nick',
            phone: '79139310012'
          },
          value: '@antirek',
        },
      ],
    },
  },
  /*{
    chatId: 25, name: "Василий ВасилийВасилийВасилий Василий",
    avatar: 'https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg',
    countUnread: 102,
    lastMessage: 'Длинное сообщение сомнительного характера в контексте размещения на малой строке',
    dialogsExpanded: true,
    actions: [
      { action: 'addDialog', title: 'Новый диалог', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=add' },
      { action: 'add', title: 'добавить', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=add' },
      { action: 'edit', title: 'изменить', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=pin' },
      { action: 'delete', title: 'удалить', icon: 'https://placehold.jp/30/dd6699/ffffff/64x64.png?text=del' },
    ],
    dialogs: [
      {
        dialogId: 'dlg_43543551',
        name: 'диалог1 79135292926',
        fullname: 'диалог1 номер 79135292926 канал whatsapp 73912000000 (основной)',   // для tooltip'а
        countUnread: 10,
        'lastActivity.timestamp': 1727001759456,   // для сортировки
        isSelected: true,
      },
      {
        dialogId: 'dlg_89789872',
        name: 'диалог2 7913529XXXX',
        fullname: 'диалог2 номер 7913529XX27 канал whatsapp 73912000000 (основной)',
        countUnread: 90,
        'lastActivity.timestamp': 1727001759111,   // для сортировки
        isSelected: false,
      },
    ],
    contact: {
      attributes: [
        {
          id: 'phone:79135292926',
          value: 'whatsapp 79135292926',
        },
        {
          id: 'phone:7913529XXXX',
          value: 'whatsapp 7913529XXXX',
        },
        {
          id: 'tgNickName:@antirek',
          value: 'telegram @antirek',
        },
      ],
    },
  },*/
  {
    chatId: 2, name: "Васильева Татьяна Александровна",
    avatar: tatianaImg,
    colorUnread: 'green',
    lastMessage: 'Лучше отправьте документы Алексею, он бухгалтер',
    countUnread: 0, isFixedTop: true,
    'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727027359',
    'lastMessage.status': 'received',
    // actions: [
    //   { action: 'edit', title: 'изменить' }, { action: 'unpin', title: 'открепить' },
    // ],
    status: "#00b972",
    metadata: '',
    contact: {
      attributes: [
        {
          id: 'phone:79831693504',
          value: 'whatsapp 79831693504',
        },
        {
          id: 'phone:74992907555',
          value: 'whatsapp 74992907555',
        },
        {
          id: 'tgNickName:@Ivan12345',
          value: 'telegram @Ivan12345',
        },
      ],
    },
    // commands: [
    //   {
    //     action: 'start',
    //     title: '/start',
    //     description: 'начать работу с чатботом'
    //   },
    //   {
    //     action: 'info',
    //     title: '/info',
    //     description: 'информация о чатботе'
    //   }
    // ]
  },
  {
    chatId: 3, name: "Анна",
    countUnread: 0, isFixedBottom: true,
    lastMessage: 'text',
    'lastMessage.status': 'sent',
    'lastActivity.timestamp': '1727027359',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'unpin', title: 'открепить' },
    ],
    metadata: '',
  },
  {
    chatId: 4, name: "Георгий", countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад', statusMessage: 'received', isFixed: false, status: "#00b972", actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
  },
  {
    chatId: 5, name: "Много SMS",
    countUnread: 0, lastMessage: 'test',
    'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727027259',
    'lastMessage.status': 'sent',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
  },
  {
    chatId: 6, name: "Виктор",
    avatar: 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
    countUnread: 7,
    lastMessage: 'Спасибо за отчет!',
    'lastActivity.time': 'час назад',         
    'lastActivity.timestamp': '1757151901',
    isFixedBottom: false,
    status: "#00b972",
    'lastMessage.status': 'read',
    actions: [
      { action: 'addDialog', title: 'новый диалог' },
      { action: 'edit', title: 'изменить' },
      { action: 'delete', title: 'удалить' },
    ],
    typing: false,
    metadata: '',
    dialogsExpanded: false,
    dialogs: [
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_new',
        attributeId: 'atr_6_1',
        channelId: 'whatsapp.W6789',
        icon: 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
        name: 'диалог1 whatsapp 79306666666',
        fullname: 'диалог1 номер 79306666666 канал whatsapp 73910001100 (основной)', 
        countUnread: 5,
        'lastActivity.time': 'час назад',  
        'lastActivity.timestamp': 1757151901,   
        isSelected: false,
      },
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_telegram',
        attributeId: 'atr_6_2',
        channelId: 'telegram.T6789',
        icon: 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
        name: 'диалог2 telegram @viktor_work',
        fullname: 'диалог2 telegram @viktor_work (telegram)',
        countUnread: 0,
        'lastActivity.time': '2 дня назад',
        'lastActivity.timestamp': 1756979101,   
        isSelected: false,
      },
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_sms',
        attributeId: 'atr_6_3',
        channelId: 'sms.S6789',
        icon: 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
        name: 'диалог3 SMS 79306666666',
        fullname: 'диалог3 SMS 79306666666',
        countUnread: 0,
        'lastActivity.time': 'неделю назад',
        'lastActivity.timestamp': 1756382701,   
        isSelected: false,
      },
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_max',
        attributeId: 'atr_6_4',
        channelId: 'max.M6789',
        icon: 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
        name: 'диалог4 Max @viktor.work',
        fullname: 'диалог4 Max viktor.work (max)',
        countUnread: 2,
        'lastActivity.time': '3 дня назад',
        'lastActivity.timestamp': 1756805101,   
        isSelected: false,
      },
      {
        dialogId: 'all',
        name: 'Просмотр всех диалогов',
        'lastActivity.timestamp': 1757151902,
        countUnread: 7,
        isSelected: false,
      }
    ],
    contact: {
      attributes: [
        {
          id: 'atr_6_1',
          type: 'phone',
          data: '79135292926',
          value: 'whatsapp 79135292926',
        },
        {
          id: 'atr_6_2',
          type: 'telegram',
          data: {
            id: '182940012994',
            nickname: 'viktor_work',
            phone: '79135292926'
          },
          value: '@viktor_work',
        },
        {
          id: 'atr_6_3',
          type: 'phone',
          data: '79135292926',
          value: 'SMS 79135292926',
        },
        {
          id: 'atr_6_4',
          type: 'max',
          data: {
            id: 'viktor.work',
            username: 'viktor.work',
            phone: '79135292926'
          },
          value: 'Max viktor.work',
        },
      ],
    },
  },
  {
    chatId: 7, name: "Василий 2",
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    'lastMessage.status': 'received',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    typing: true,
    metadata: '',
  },
  {
    chatId: 8, name: "Дмитрий",
    avatar: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
    dialogsExpanded: false,
    dialogs: [
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_new',
        attributeId: 'atr_6_1',
        channelId: 'whatsapp.W6789',
        icon: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
        name: 'диалог1 whatsapp 79306666666',
        fullname: 'диалог1 номер 79306666666 канал whatsapp 73910001100 (основной)', 
        'lastActivity.time': 'час назад',  
        'lastActivity.timestamp': 1757151901,   
        isSelected: false,
      },
      { 
        branchId: 'bch_6',
        dialogId: 'dlg_6_telegram',
        attributeId: 'atr_6_2',
        channelId: 'telegram.T6789',
        icon: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
        name: 'диалог2 telegram @dmitriy_work',
        fullname: 'диалог2 telegram @dmitriy_work (telegram)',
        countUnread: 0,
        'lastActivity.time': '2 дня назад',
        'lastActivity.timestamp': 1756979101,   
        isSelected: false,
      },
    ],
  },
  {
    chatId: 9, name: "Арсений",
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    'lastMessage.status': 'read',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: 'Данияр',
  },
  {
    chatId: 10, name: "Василий",
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
  },
  {
    chatId: 11, name: "Василий",
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
  },
  {
    chatId: 12, name: "Василий",
    countUnread: 0, lastMessage: 'test', 'lastActivity.time': 'час назад',
    'lastActivity.timestamp': '1727021159',
    actions: [
      { action: 'edit', title: 'изменить' }, { action: 'delete', title: 'удалить' },
    ],
    metadata: '',
  },
];
