// register modal component

Vue.component('vue-login-component', {
  template: `
    <div id="modal_div" class="modal">
      <div class="modal-dialog modal-sm">
        <!-- Modal content -->
        <div class="modal-content">
          <div class="modal-header">
            <button v-on:click="authenticate" id="login-button" class="btn btn-primary">Login via StackExchange</button>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    authenticate: function() {
      // `this` inside methods points to the Vue instance
      console.log("in authenticate")
      $.getScript( "https://api.stackexchange.com/js/2.0/all.js" )
      .done(function( script, textStatus ) {
        SE.init({
          clientId: 9429,
          key: 'Oi2fc61XpWFaTzCK9*vljw((',
          // Used for cross domain communication, it will be validated
          channelUrl: 'http://localhost/blank',
          // Called when all initialization is finished
          complete: function(data) {
              $('#login-button')
                  .removeAttr('disabled')
                  .text('Click here to login');

          }
        })
        SE.authenticate({
          success: function(data) {
            sessionStorage.setItem("at", data.accessToken);
            for (s_network of data.networkUsers) {
              if( s_network.site_url === "https://stackoverflow.com" ) {
                console.log("Got data from SO")
                sessionStorage.setItem("uid", s_network.user_id);
                login.hide_modal_box()
                break
              }
            }
          },
          error: function(data) {
              alert('an error occurred:\n' + data.errorName + '\n' + data.errorMessage);
          },
          networkUsers: true
        });
      })
      .fail(function( jqxhr, settings, exception ) {
        console.log("Error in authenticating via SE")
      });
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
      this.modal_box= true
    },
    hide_modal_box: function() {
      console.log("hiding_modal_box")
      this.modal_box= false
      app.get_all_answers()
    },
    status_modal_box: function() {
      console.log(this.modal_box)
    },
  }
});

var app = new Vue({
  delimiters: ['${', '}'],
  el: '#home',
  data: {
    key: "Oi2fc61XpWFaTzCK9*vljw((",
    site_name: "stackoverflow",
    site_url: "https://stackoverflow.com",
    api_url: "https://api.stackexchange.com",
    answers_working: [],
    answers_404: []
  },
  methods: {
    add_working: function(item_obj) {
      ques_url = this.site_url + "/questions/" + item_obj.question_id
      item_obj["q_url"] = ques_url
      this.answers_working.push({ obj: item_obj})
    },
    add_404: function(item_obj) {
      ques_url = this.site_url + "/questions/" + item_obj.question_id
      item_obj["q_url"] = ques_url
      this.answers_404.push({ obj: item_obj})
    },
    check_if_has404: function(item) {
      let full_list = '';
      var self = this
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": this.api_url + "/answers/" + item.answer_id + "?access_token=" + sessionStorage.getItem('at') + "&site=stackoverflow&key=" + this.key + "&filter=withbody",
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
              url: "/check_url?url=" + encodeURIComponent(link),
            }).done(function (msg) {
                self.add_working(item)
              }).fail(function(msg) {
                self.add_404(item)
                console.log( "error" + JSON.stringify(msg) );
              });
          }
        }
      });
    },
    process_answers: function(items) {
      console.log("In : process_answers()")
      let full_list = '';
      for (item of items) {
          this.check_if_has404(item)
      }
    },
    test() {
      console.log("testing you")
    },
    get_all_answers: function() {
      console.log("In : get_all_answers()")
      var self = this;
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": this.api_url + "/me/answers?access_token=" + sessionStorage.getItem('at') + "&site=" + this.site_name + "&key=" + this.key,
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


if (sessionStorage.getItem("at") === null) {
  login.show_modal_box()
}
else {
  app.get_all_answers()
}
