using Ordering.Application.Handlers;
using Ordering.Application.Mappers;
using Ordering.Application.Queries;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.Application.Tests;

public class GetRecentActivitiesQueryHandlerTests
{
    private readonly IActivityRepository _repository = Substitute.For<IActivityRepository>();

    public GetRecentActivitiesQueryHandlerTests()
    {
        _repository
            .GetActivitiesAsync(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string?>(), Arg.Any<string?>(),
                Arg.Any<DateTime?>(), Arg.Any<DateTime?>(), Arg.Any<string?>())
            .Returns(call => new PagedResult<Activity>
            {
                PageIndex = call.ArgAt<int>(0),
                PageSize = call.ArgAt<int>(1),
            });
    }

    [Theory]
    [InlineData(0, 10, 0, 10)]
    [InlineData(-1, 10, 0, 10)]
    [InlineData(2, 0, 2, 1)]
    [InlineData(0, -3, 0, 1)]
    [InlineData(0, 5000, 0, IActivityRepository.MaxPageSize)]
    public async Task Paging_is_clamped_before_hitting_the_repository(
        int pageIndex, int pageSize, int expectedIndex, int expectedSize)
    {
        var handler = new GetRecentActivitiesQueryHandler(_repository, new OrderMapper());

        var result = await handler.Handle(new GetRecentActivitiesQuery(pageIndex, pageSize), CancellationToken.None);

        result.PageIndex.ShouldBe(expectedIndex);
        result.PageSize.ShouldBe(expectedSize);
        await _repository.Received(1).GetActivitiesAsync(expectedIndex, expectedSize,
            Arg.Any<string?>(), Arg.Any<string?>(), Arg.Any<DateTime?>(), Arg.Any<DateTime?>(), Arg.Any<string?>());
    }
}
