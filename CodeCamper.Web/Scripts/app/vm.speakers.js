﻿define('vm.speakers',
    ['ko', 'router', 'datacontext', 'filter', 'sort', 'messenger', 'config', 'store'],
    function (ko, router, datacontext, filter, sort, messenger, config, store) {
        var
            speakersFilter = new filter.SpeakersFilter(),
            speakers = ko.observableArray(),
            stateKey = { searchText: 'vm.speakers.searchText' },

            tmplName = 'speakers.view',

            getSpeakers = function () {
                datacontext.speakerSessions.getLocalSpeakers(speakers, {
                    filter: speakersFilter,
                    sortFunction: sort.speakerSort
                });
            },
            
            refresh = function () {
                restoreFilter();
                getSpeakers();
            },

            canLeave = function () {
                return true;
            },

            activate = function () {
                messenger.publish.viewModelActivated({ canleaveCallback: canLeave });
                refresh();
            },

            forceRefresh = ko.asyncCommand({
                execute: function (complete) {
                    datacontext.speakerSessions.forceDataRefresh()
                    .done(refresh)
                    .always(complete);
                },
                canExecute: function (isExecuting) {
                    return true;
                }
            }),

            gotoDetails = function (selectedSpeaker) {
                if (selectedSpeaker && selectedSpeaker.id()) {
                    router.navigateTo(config.hashes.speakers + '/' + selectedSpeaker.id());
                }
            },

            clearFilter = function () {
                if (speakersFilter.searchText().length) {
                    speakersFilter.searchText('');
                }
            },

            restoreFilter = function () {
                var val = store.fetch(stateKey.searchText);
                if (val !== speakersFilter.searchText) {
                    speakersFilter.searchText(store.fetch(stateKey.searchText));
                }
            },

            onFilterChange = function () {
                store.save(stateKey.searchText, speakersFilter.searchText());
                refresh();
            },

            init = function () {
                speakersFilter.searchText.subscribe(onFilterChange);
            };

        init();

        return {
            activate: activate,
            canLeave: canLeave,
            clearFilter: clearFilter,
            forceRefresh: forceRefresh,
            gotoDetails: gotoDetails,
            speakersFilter: speakersFilter,
            speakers: speakers,
            tmplName: tmplName
        };
    });