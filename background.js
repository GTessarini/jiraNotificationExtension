
const jiraNotificationsSelector = `document.querySelector('a[href$="/home?src=globalnav&ref=jira"] div div:nth-child(2)');`; 
const chromeNotificationId = "JiraNotifications";
var tabId = null;

chrome.notifications.onClicked.addListener(function () {    
    chrome.tabs.query({ title: "*JIRA*" }, function (tab) {
        chrome.tabs.highlight({ 'tabs': tab[0].index }, function () { });
    });  
    chrome.notifications.clear(chromeNotificationId, function () { 
        chrome.tabs.executeScript(null,
            {
                code:
                    `
                    var jiraNotifications = ` + jiraNotificationsSelector + `
                    if(jiraNotifications){jiraNotifications.click();}
                    `
            }, function () { });
    });
});

function queryJiraNotification(){
    chrome.tabs.query({ title: "*JIRA*" }, function (tab) {
        var intervalCheckNotification = window.setInterval(function () {
            chrome.tabs.executeScript(tab[0].id,
                {
                    code:
                        `
                    var status = false;
                    var jiraNotifications = ` + jiraNotificationsSelector + `
                    if (jiraNotifications && jiraNotifications.textContent.trim() != "") {
                        status = true;                    
                    }
                    status
                    `
                },
                function (result) {
                    var resultStatus = (result[0] == "true");
                    if (resultStatus) {
                        chrome.notifications.create(
                            chromeNotificationId,
                            {
                                type: "basic",
                                title: "JiraNotifications",
                                message: "You have notifications on JIRA",
                                iconUrl: "icon.png"
                            }, function () { }
                        );
                    }
                }
            );
        }, 10000);
    });
}

chrome.runtime.onInstalled.addListener(function(){
    queryJiraNotification();
});

chrome.webNavigation.onCompleted.addListener(function(){
    queryJiraNotification();
}, { url: [{ urlContains: '.atlassian.' }] });

/* Gabriel Tessarini */