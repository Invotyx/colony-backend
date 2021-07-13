const GSM7 =
  '\\\n @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}[~]|€ÆæßÉ!"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';

export const smsCount = (message = '') => {
  const config = {
    lengths: {
      ascii: [
        160,
        306,
        459,
        612,
        765,
        918,
        1071,
        1224,
        1377,
        1530,
        1683,
        1836,
        1989,
        2142,
        2295,
        2448,
        2601,
        2754,
        2907,
        3060,
        3213,
        3366,
        3519,
        3672,
        3825,
        3978,
        4131,
        4284,
        4437,
        4590,
      ],
      unicode: [
        70,
        134,
        201,
        268,
        335,
        402,
        469,
        536,
        603,
        670,
        737,
        804,
        871,
        938,
        1005,
        1072,
        1139,
        1206,
        1273,
        1340,
        1407,
        1474,
        1541,
        1608,
        1675,
        1742,
        1809,
        1876,
        1943,
        2010,
      ],
      // ascii: [160, 306, 459, 612, 765, 918, 1071, 1224, 1377, 1530, 1683],
      //unicode: [70, 134, 201, 268, 335, 402, 469, 536, 603, 670, 737, 804],
    },
  };

  let cutStrLength = 0;

  let smsType,
    smsLength = 0,
    smsCount = -1,
    charsLeft = 0,
    text = message,
    isUnicode = false;

  // //console.log('length', text.length);

  const breakdown = [];

  for (var charPos = 0; charPos < text.length; charPos++) {
    const item = {
      character: text[charPos],
      encoding: 'GSM7',
      cost: 1,
    };

    switch (text[charPos]) {
      case '\n':
      case '[':
      case ']':
      case '\\':
      case '^':
      case '{':
      case '}':
      case '|':
      case '€':
      case '~':
        smsLength += 2;
        item.cost = 2;
        break;

      default:
        smsLength += 1;
    }

    //!isUnicode && text.charCodeAt(charPos) > 127 && text[charPos] != "€" && (isUnicode = true)
    //        if (text.charCodeAt(charPos) > 127 && text[charPos] != '€')
    if (GSM7.indexOf(text[charPos]) < 0) {
      isUnicode = true;
      item.encoding = 'Unicode';
    }

    breakdown.push(item);
  }

  if (isUnicode) smsType = config.lengths.unicode;
  else smsType = config.lengths.ascii;

  for (var sCount = 0; sCount < 30; sCount++) {
    cutStrLength = smsType[sCount];
    if (smsLength <= smsType[sCount]) {
      smsCount = sCount + 1;
      charsLeft = smsType[sCount] - smsLength;
      break;
    }
  }

  return {
    segments: smsCount,
    unicode: isUnicode,
    charsLeft,
    length: smsLength,
    maxLength: smsType[smsCount - 1],
    breakdown: breakdown,
  };

  // if(s.cut) e.val(text.substring(0, cutStrLength));
  // smsCount == -1 && (smsCount = s.maxSmsNum, charsLeft = 0);
};
