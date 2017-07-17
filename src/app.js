import React, {Component} from 'react';
import {render} from 'react-dom';
import {Header, Grid, Card, Button, Select, Modal, Icon, Form, Input, TextArea} from 'semantic-ui-react';
import fetch from 'isomorphic-fetch';
import moment from 'moment';

class Goals extends Component {
  constructor() {
    super()
    this.state = {
      goals: [],
      sort: 'Highest',
      newGoal: {},
      modalOpen: false
    }
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.raisePriority = this.raisePriority.bind(this);
    this.decreasePriority = this.decreasePriority.bind(this);
    this.changeOrderPriority = this.changeOrderPriority.bind(this);
  }

  componentWillMount() {
    this.pusher = new Pusher(window.pusherDetails.key, {
      cluster: window.pusherDetails.cluster,
      encrypted: true
    });
    this.goalsChannel = this.pusher.subscribe('goals');

    fetch('/api/goals', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }).then(response => {
      if(!response.ok) {
        return response.json().then(Promise.reject.bind(Promise))
      }
      return response.json()
    }).then(json => {
      this.setState({goals: json})
    }).catch(err => {
      console.log('Error happened', err);
    })
  }

  componentDidMount() {
    this.goalsChannel.bind('new', (goal) => {
      var goals = this.state.goals;
      goals.push(goal);
      this.setState({goals: goals})
    });
    this.goalsChannel.bind('update', (goal) => {
      var goals = this.state.goals;
      var newGoals = goals.map(_goal => {
        if(_goal._id === goal._id) {
          return Object.assign({}, goal)
        } else {
          return _goal
        }
      })
      this.setState({goals: newGoals})
    })
  }

  raisePriority (id, priority) {
    fetch('/api/goal/' + id, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify({priority: priority + 1})
    }).then(response => {
      if (!response.ok) {
        return response.json().then(Promise.reject.bind(Promise));
      }
      return response.json()
    }).then(json => {
      console.log('Priority Increased');
    }).catch(err => {
      console.log('There was an error!');
    })
  }

  decreasePriority (id, priority) {
    fetch('/api/goal/' + id, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify({priority: priority -1})
    }).then(response => {
      if (!response.ok) {
        return response.json().then(Promise.reject.bind(Promise));
      }
      return response.json()
    }).then(json => {
      console.log('Priority Decreased');
    }).catch(err => {
      console.log('There was an error');
    })
  }

  changeOrderPriority(data) {
    this.setState({sort: data.value});
  }

  handleOpen (e) {
    this.setState({modalOpen: true});
  }

  handleClose (e) {
    this.setState({modalOpen: false, newGoal: {}});
  }

  handleChange (e,d) {
    var goal = this.state.newGoal
    var newGoal = Object.assign({}, goal, {[d.name]: d.value});
    this.setState({newGoal: newGoal});
  }

  handleSubmit(e) {
    fetch('/api/goal', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(this.state.newGoal)
    }).then(response => {
      if(!response.ok) {
        return response.json().then(Promise.reject.bind(Promise))
      }
      return response.json()
    }).then(json => {
      console.log('New obj', json)
    }).catch(err => {
      console.log('Error happened', err);
    })
    this.handleClose()
  }

  render() {
    const options =  [
      { key: '1', text: '1', value: 1 },
      { key: '2', text: '2', value: 2 },
      { key: '3', text: '3', value: 3 },
      { key: '4', text: '4', value: 4 },
      { key: '5', text: '5', value: 5 },
    ]
    return (
      <div>
        <Header as='h4' color='blue' block>SGY Goals Tracker</Header>
        <Grid centered columns={2}>
          <Grid.Column>
            <Modal
              trigger={<Button onClick={this.handleOpen}>Add New Goal</Button>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
            >
                <Header content='Add New Goal' />
                <Modal.Content>
                  <Form>
                    <Form.Group widths='equal'>
                      <Form.Field id='form-input-control-title' control={Input} label='Title' name='title' placeholder='title' onChange={this.handleChange}/>
                      <Form.Field id='form-input-control-email' control={Input} label='Email' name='email' placeholder='email' onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field id='form-textarea-control-description' control={TextArea} label='Description' name='description' placeholder='description' onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field control={Select} label='Priority' options={options} name='priority' placeholder='priority' onChange={this.handleChange}/>
                    </Form.Group>
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button color='red' inverted onClick={this.handleClose}>
                    <Icon name='cancel' /> Cancel
                  </Button>
                  <Button color='green' inverted onClick={this.handleSubmit}>
                    <Icon name='checkmark' /> Create
                  </Button>
                </Modal.Actions>
              </Modal>
          </Grid.Column>
        </Grid>
        <Grid>
          <Grid.Column width={4}>
            Order By Priority:
            <Select style={{marginLeft: '10px'}}placeholder='Select Priority' options={[
                {
                  key: 'Highest',
                  value: 'Highest',
                  text: 'Highest'
                },
                {
                  key: 'Lowest',
                  value: 'Lowest',
                  text: 'Lowest'
                }
              ]} onChange={(e,data) => {this.changeOrderPriority(data)}}/>
          </Grid.Column>
          <Grid.Column stretched width={12}>
            <Card.Group>
              {this.state.goals.sort((a,b) => {
                if (this.state.sort === 'Highest') {
                  return b.priority - a.priority
                } else {
                  return a.priority - b.priority
                }
              }).map(goal => {
                return (
                  <Card fluid key={goal._id}>
                    <Card.Content>
                      <Card.Header>
                        {goal.title}
                      </Card.Header>
                      <Card.Meta>
                        {goal.email}
                      </Card.Meta>
                      <Card.Description>
                        {goal.description}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      Priority: {goal.priority}
                    </Card.Content>
                    <Card.Content extra>
                      Posted: {moment(goal.createdAt).fromNow()}
                    </Card.Content>
                    <Card.Content extra>
                      <div className='ui two buttons'>
                        <Button basic color='green' disabled={goal.priority >= 5} onClick={() => {this.raisePriority(goal._id, goal.priority)}}>Raise Priority</Button>
                        <Button basic color='red' disabled={goal.priority <= 1} onClick={() => {this.decreasePriority(goal._id, goal.priority)}}>Decrease Priority</Button>
                      </div>
                    </Card.Content>
                  </Card>
                )
              })}
            </Card.Group>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

render(<Goals />, document.getElementById('app'));