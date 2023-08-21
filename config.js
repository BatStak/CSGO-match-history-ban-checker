const maxRetries = 3;

const banStats = {
  vacBans: 0,
  gameBans: 0,
  recentBans: 0,
};

const funStats = {
  numberOfMatches: 0,
  totalKills: 0,
  totalAssists: 0,
  totalDeaths: 0,
  totalWins: 0,
  totalWaitTime: 0,
  totalTime: 0,
};

const config = {
  yourapikey: '',
  gameType: 'all',
  historyDate: undefined,
};

const profileURI = document.querySelector('.profile_small_header_texture > a')?.href;
const section = new URLSearchParams(window.location.search).get('tab');

const mapNameRegex = /(Competitive|Wingman) (.+)/;
const waitTimeRegex = /Wait Time\: (\d+)\:(\d+)/;
const matchTimeRegex = /Match Duration\: (\d+)\:(\d+)/;
const scoreRegex = /(\d+) : (\d+)/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateMatchRegex = /(20\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;

let timerLoadMatchHistory = null;

/**
 * Array of {} with those attributes :
 * name
 * count
 * wins
 * draws
 * loses
 * bans
 * bansAfter
 */
const mapsStats = [];
let matchIndex = 1;
const matchIndexWithBans = [];

let startDate = '';
let endDate = '';

// array of steamid34
const playersList = [];

/**
 * Array of {} with those attributes :
 * steamid
 * daySinceLastBan
 * after
 * profileUrl
 */
const bannedPlayers = [];

let checkBanStarted = false;

const myProfileStatsCheckedClass = 'csgo-history-mystats-checked';
const matchWinClass = 'csgo-history-match-win';
const matchDrawClass = 'csgo-history-match-draw';
const matchLoseClass = 'csgo-history-match-lose';
const longGameClass = 'csgo-history-long-game';
const shortGameClass = 'csgo-history-short-game';
const abortedGameClass = 'csgo-history-aborted-game';

const profileToCheckClass = 'csgo-history-check-profile';
const profileCheckingClass = 'csgo-history-ban-checking';
const profileCheckedClass = 'vchecked';

const columnBanResultAddedClass = 'csgo-history-ban-column-added';
const columnBanResultClass = 'csgo-history-column-ban';
const tableFormattedClass = 'csgo-history-result-formatted';