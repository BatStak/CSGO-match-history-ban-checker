import { Injectable } from '@angular/core';
import { Database, MatchFormat } from '../models';
import { UtilsService } from './utils.service';

@Injectable()
export class DataService {
  database: Database = {};

  constructor(private _utilsService: UtilsService) {}

  init(database: any) {
    this.database = database;
    this.database ??= {};
    this.database.matches ??= [];
    this.database.players ??= [];
  }

  parseMatch(match: HTMLElement, format: MatchFormat) {
    const matchId = this._utilsService.getDateOfMatch(match);
    this.database.matches ??= [];

    let matchInfo = this.database.matches.find((m) => m.id === matchId);
    if (!matchInfo) {
      matchInfo = {
        id: matchId,
        map: this._utilsService.getMap(match),
        finished: true,
        format: format,
        overtime: false,
        replayLink: this._utilsService.getReplayLink(match),
        teamA: { playersSteamID64: [] },
        teamB: { playersSteamID64: [] },
        playersSteamID64: [],
      };
      this.database.matches.push(matchInfo);
    }

    matchInfo.finished ??= true;
    matchInfo.format ??= format;
    matchInfo.overtime ??= false;
    matchInfo.teamA ??= { playersSteamID64: [] };
    matchInfo.teamB ??= { playersSteamID64: [] };
    matchInfo.playersSteamID64 ??= [];

    const players = match.querySelectorAll(
      '.csgo_scoreboard_inner_right > tbody > tr'
    );

    let isTeamA = true;
    players.forEach((playerRow, index) => {
      if (playerRow.children.length > 1) {
        const lastColumn = playerRow.children[playerRow.children.length - 1];
        lastColumn.after(lastColumn.cloneNode(true));
        const newColumn = playerRow.children[playerRow.children.length - 1];
        if (index === 0) {
          newColumn.textContent = 'Ban?';
        } else {
          newColumn.textContent = '-';

          // get html attributes
          const profileLink =
            playerRow.querySelector<HTMLLinkElement>('.linkTitle')!;
          const steamID64 = this._utilsService.getSteamID64FromMiniProfileId(
            profileLink.dataset['miniprofile']!
          );

          // add steamId to matchInfo players list
          if (!matchInfo!.playersSteamID64.includes(steamID64)) {
            matchInfo!.playersSteamID64.push(steamID64);
          }

          // add steamId to team X players list
          if (isTeamA) {
            matchInfo!.teamA!.playersSteamID64.push(steamID64);
          } else {
            matchInfo!.teamB!.playersSteamID64.push(steamID64);
          }

          // add playerInfo to global list
          let playerInfo = this.database.players!.find(
            (p) => p.steamID64 === steamID64
          );
          if (!playerInfo) {
            playerInfo = {
              steamID64: steamID64,
              name: profileLink.textContent?.trim(),
              profileLink: profileLink.href,
              avatarLink:
                playerRow.querySelector<HTMLImageElement>('.playerAvatar img')
                  ?.src,
              lastPlayWith: matchInfo!.id,
              matches: [matchInfo!.id!],
            };
            this.database.players?.push(playerInfo);
          } else if (playerInfo.matches.includes(matchInfo!.id!)) {
            playerInfo.matches.push(matchInfo!.id!);
          }
        }
      } else {
        isTeamA = false;
        const scores = playerRow.textContent?.trim().match(/(\d+) : (\d+)/);
        if (scores?.length && scores?.length > 2) {
          const scoreA = parseInt(scores[1], 10);
          const scoreB = parseInt(scores[2], 10);
          matchInfo!.teamA!.score = scoreA;
          matchInfo!.teamB!.score = scoreB;

          matchInfo!.teamA!.win = this._getWin(scoreA, scoreB);
          matchInfo!.teamB!.win = this._getWin(scoreB, scoreA);

          if (matchInfo!.format === MatchFormat.MR24 && scoreA + scoreB > 24) {
            matchInfo!.overtime = true;
          }
          matchInfo!.finished = this._isFinished(scoreA, scoreB, format);
        }
      }
    });

    match.classList.add('parsed');
  }

  private _isFinished(
    scoreA: number,
    scoreB: number,
    format: MatchFormat
  ): boolean {
    if (format === MatchFormat.MR24) {
      if (scoreA === scoreB && scoreA === 15) {
        return true;
      }
      return scoreA !== scoreB && (scoreA === 13 || scoreB === 13);
    } else {
      if (scoreA === scoreB && scoreA === 8) {
        return true;
      }
      return scoreA !== scoreB && (scoreA === 9 || scoreB === 9);
    }
  }

  private _getWin(teamScore: number, oppositeTeamScore: number) {
    return teamScore > oppositeTeamScore
      ? 1
      : teamScore < oppositeTeamScore
      ? -1
      : 0;
  }
}