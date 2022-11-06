<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'VoteFreetForm',
  mixins: [InlineForm],
  data() {
    return {
      url: '/api/freets/:freetId?',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'upvote', label: 'Upvote', value: '', type: "radio"},
        {id: 'downvote', label: 'Downvote', value: '', type: "radio"}
      ],
      title: 'Rate this freet',
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully rated freet!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
