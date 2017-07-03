var app = new Vue({
  delimiters: ['${', '}'],
  el: '#app',
  data: {
    parentMessage: 'Parent',
    answers_working: [],
    answers_404: []
  },
  methods: {
    updateMessage: function () {
      app.items.push({ parentMessage: 'Bauz' })
    },
    add_working: function(item_obj) {
      ques_url = "https://stackoverflow.com/questions/" + item_obj.question_id
      item_obj["q_url"] = ques_url
      app.answers_working.push({ obj: item_obj})
    },
    add_404: function(item_obj) {
      ques_url = "https://stackoverflow.com/questions/" + item_obj.question_id
      item_obj["q_url"] = ques_url
      app.answers_404.push({ obj: item_obj})
    }
  },
})


if (sessionStorage.getItem("at") === null) {
    window.location.href = "http://localhost/login";
}

function check_if_has404(item) {
  let full_list = '';
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.stackexchange.com/answers/" + item.answer_id + "?access_token=" + sessionStorage.getItem('at') + "&site=stackoverflow&key=Oi2fc61XpWFaTzCK9*vljw((&filter=withbody",
    "method": "GET",
  }

  $.ajax(settings).done(function (response) {
    var hrefs = response.items[0]['body'].match(/href="([^"]*")/g);
    if(hrefs) {
      for ( href of hrefs) {
        link = href.substring(href.indexOf('=')+1).replace(/"/g, "")
        url = window.location.origin + "/check_url?url=" + encodeURIComponent(link)
        $.ajax({
          crossDomain: true,
          type: "GET",
          url: url,
        }).done(function (msg) {
            app.add_working(item)
          }).fail(function(msg) {
            app.add_404(item)
            console.log( "error" + JSON.stringify(msg) );
        });
      }
    }
 });

}

function process_answers(items) {
  console.log("In : process_answers()")
  let full_list = '';
  for (item of items) {
      check_if_has404(item)
  }
}

function get_all_answers() {
  console.log("In : get_all_answers()")
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.stackexchange.com/me/answers?access_token=" + sessionStorage.getItem('at') + "&site=stackoverflow&key=Oi2fc61XpWFaTzCK9*vljw((",
    "method": "GET",
  }

  $.ajax(settings).done(function (response) {
    process_answers(response.items)
  }).
  fail(function (response) {
    console.log("Error while fetching all answers. Response: " + response)
    window.location.href = "http://localhost/login"
  });

}

get_all_answers();
