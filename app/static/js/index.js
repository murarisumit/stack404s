// register modal component

Vue.component('vue-login-component', {
  template: `
    <div id="modal_div" class="modal">
      <div class="modal-dialog modal-sm">
        <!-- Modal content --> <div class="modal-content">
          <div class="modal-header">
            <button v-on:click="authenticate" id="login-button" class="btn btn-primary">Login via StackExchange</button>
          </div>
          <center> <small> We don't store any of your details </small>
        </div>
      </div>
    </div>
  `,
  methods: {
    authenticate: function() {
      // `this` inside methods points to the Vue instance
      console.log("in authenticate");
      window.open('https://stackexchange.com/oauth/dialog?client_id=9429&redirect_uri=' + app.redirect_url);
    }
  },
})

var login = new Vue({
  el: '#login',
  data: {
    //show component is modal_box is true
    modal_box: false,
    name: "Sumit"
  },
  methods: {
    show_modal_box: function() {
      console.log("show_modal_box")
      this.modal_box= true;
    },
    hide_modal_box: function() {
      console.log("hiding_modal_box")
      this.modal_box= false;
      app.get_all_answers();
    },
    status_modal_box: function() {
      console.log(this.modal_box);
    },
  }
});

var app = new Vue({
  delimiters: ['${', '}'],
  el: '#home',
  data: {
    key: config.key,
    redirect_url: config.redirect_url,
    site_name: config.site_name,
    site_url: config.site_url,
    api_url: config.api_url,
    answers_working: [],
    answers_404: []
  },
  methods: {
    add_working: function(item_obj) {
      console.log("In: add_working")
      ques_url = this.site_url + "/questions/" + item_obj.question_id
      item_obj["q_url"] = ques_url
      this.answers_working.push({ obj: item_obj})
    },
    add_404: function(answer_obj) {
      var self = this
      console.log("In: add_404")
      q_url = this.site_url + "/questions/" + answer_obj.question_id
      //answer_obj["ques_url"] = q_url
      answer_obj["ques_url"] = q_url + "#answer-" + answer_obj.answer_id

      fetch_ques_url = this.api_url + "/questions/" + answer_obj.question_id + "?access_token=" + localStorage.getItem('at') + "&site=stackoverflow&key=" + this.key
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": fetch_ques_url,
        "method": "GET",
      }
      $.ajax(settings).done(function (response) {
        console.log(response)
        var q_title = response.items[0]['title']
        console.log("q_title is: " + q_title)
        answer_obj['ques_title'] = q_title
      }).fail(function(msg) {
        console.log("Unable to pull question title. Error: " + msg)
        answer_obj['ques_title'] = "Unable to pull question title"
      }).always(function(msg) {
        self.answers_404.push({ obj: answer_obj})
      });
    },
    check_if_has404: function(item) {
      console.log("In: check_if_has404")
      let full_list = '';
      var self = this
      fetch_answer_url = this.api_url + "/answers/" + item.answer_id + "?access_token=" + localStorage.getItem('at') + "&site=stackoverflow&key=" + this.key + "&filter=withbody"
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": fetch_answer_url,
        "method": "GET",
      }
      $.ajax(settings).done(function (response) {
        var hrefs = response.items[0]['body'].match(/href="([^"]*")/g);
        if(hrefs) {
          for ( href of hrefs) {
            link = href.substring(href.indexOf('=')+1).replace(/"/g, "")
            $.ajax({
              crossDomain: true,
              type: "GET",
              dataType: "json",
              url: "https://stack404s.murarisumit.in/checkurl?url=" + encodeURIComponent(link),
            }).done(function (msg) {
                if(msg.statusCode == 200) {
                  self.add_working(item)
                }
                else {
                  self.add_404(item)
                }
              }).fail(function(msg) {
                console.log("Error while checking url status")
                self.add_404(item)
                console.log( "error" + JSON.stringify(msg) );
              });
          }
        }
      });
    },
    process_answers: function(items) {
      console.log("In : process_answers()")
      for (item of items) {
          this.check_if_has404(item)
      }
    },
    get_all_answers: function(access_token) {
      console.log("In : get_all_answers()")
      var self = this;
      var get_token_url =  this.api_url + "/me/answers?access_token=" + access_token + "&site=" + this.site_name + "&key=" + this.key
      console.log(get_token_url)
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": get_token_url,
        "method": "GET",
      }
      $.ajax(settings).done(function (response) {
        self.process_answers(response.items)
      }).
      fail(function (response) {
        console.log("Error while fetching all answers. Response: " + response.responseText)
        alert("Error while fetching answers, reloading the page ")
        location.reload()
      });
    }
  }
})


if (localStorage.getItem("at") === null) {
  login.show_modal_box()
}
else {
  app.get_all_answers(localStorage.getItem("at"))
}
