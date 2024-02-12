import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { BanStatisticsComponent } from './ban-statistics.component';

describe('BanStatisticsComponent', async () => {
  let component: BanStatisticsComponent;
  let dataService: DataService;
  let fixture: ComponentFixture<BanStatisticsComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BanStatisticsComponent],
      providers: [DatabaseService, UtilsService, DataService],
    });
    fixture = TestBed.createComponent(BanStatisticsComponent);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
  });

  it('Test template no banned player', async () => {
    dataService.playersBannedAfter = [];

    component._update();
    fixture.detectChanges();
    expect(dom.textContent).toContain('No banned player');

    dataService.playersBannedAfter.push({
      matches: [],
      steamID64: 'test',
    });
    component._update();
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('No banned player');
    expect(dom.textContent).toContain(
      '1 have been banned after playing with you'
    );
  });

  it('Test update', async () => {
    // we add 100 players in database
    dataService.players = [];
    for (let i = 0; i < 100; i++) {
      dataService.players.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 10 banned players in database
    dataService.playersBannedAfter = [];
    for (let i = 0; i < 10; i++) {
      dataService.playersBannedAfter.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 100 matches in database
    dataService.matches = [];
    for (let i = 0; i < 100; i++) {
      dataService.matches.push({
        playersSteamID64: [],
      });
    }

    // 10% of players, 0 match concerned
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(100);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(0);
    expect(component.bannedPourcentage).toEqual(10);
    expect(component.matchPourcentage).toEqual(0);

    // 1 match concerned (1%) of 100 matches
    dataService.matches[0].playersSteamID64.push('steamID0');
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(100);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(1);
    expect(component.matchPourcentage).toEqual(1);

    // 3 match concerned (6%) of 50 matches
    dataService.matches[1].playersSteamID64.push('steamID0');
    dataService.matches[2].playersSteamID64.push('steamID0');
    dataService.matches.splice(50, 50);
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(3);
    expect(component.matchPourcentage).toEqual(6);

    // 10 players out of 50 (20%)
    dataService.players.splice(50, 50);
    component._update();
    expect(component.playersCount).toEqual(50);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.bannedPourcentage).toEqual(20);

    // we now have 1050 players and 10 banned players (0.95%)
    for (let i = 0; i < 1000; i++) {
      dataService.players.push({
        matches: [],
        steamID64: `steamID-new-${i}`,
      });
    }
    component._update();
    expect(component.playersCount).toEqual(1050);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.bannedPourcentage).toEqual(0.95);

    // we now have 968 matches and 10 banned players (0.95%)
    for (let i = 0; i < 918; i++) {
      dataService.matches.push({
        playersSteamID64: [],
      });
    }
    component._update();
    expect(component.playersCount).toEqual(1050);
    expect(component.matchesCount).toEqual(968);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(3);
    expect(component.matchPourcentage).toEqual(0.31);
  });
});